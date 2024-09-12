//openai_server.js
const express = require('express');
const bodyParser = require('body-parser');
const OpenAI = require('openai');
const mongoose = require('mongoose');
//const auth = require('./middleware/auth'); // Ensure the auth middleware path is correct

const app = express();
const PORT = process.env.PORT || 4000;

mongoose
    .connect('mongodb+srv://eleveg10:eleveg@cluster0.z9ghmo4.mongodb.net/', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.error('MongoDB connection error:', err));

const userSchema = new mongoose.Schema({
    name: String,
    height: Number,
    weight: Number,
    trainingDays: String,
    activityLevel: String,
    healthGoals: String,
    mentalHealthGoals: String,
    membership: String,
    favouriteIngredients: String,
    dislikedIngredients: String,
});

const availableCropsSchema = new mongoose.Schema({
    crop: String,
});

const recommendationsSchema = new mongoose.Schema({
    recommendations: { type: String, required: true },
});

const User = mongoose.model('User', userSchema);
const Crop = mongoose.model('Crop', availableCropsSchema);
const Recommendations = mongoose.model('Recommendation', recommendationsSchema);

app.use(bodyParser.json());

const openai = new OpenAI();

app.post('/generaterecommendations', async (req, res) => {
    const { user_data, crop_data } = req.body;

    // Log the incoming request body
    console.log('Received request:', req.body);

    if (!user_data || !crop_data) {
        return res.status(400).json({ error: 'User data and crop data are required' });
    }

    // Log the received user_data and crop_data
    console.log('User data:', user_data);
    console.log('Crop data:', crop_data);

    // Validate user_data structure
    const requiredUserFields = ['Height', 'Weight', 'FavouriteIngredients', 'DislikedIngredients', 'ActivityLevel', 'HealthGoals', 'MentalHealthGoals', 'Membership'];
    const missingUserFields = requiredUserFields.filter(field => !(field in user_data));
    if (missingUserFields.length > 0) {
        return res.status(400).json({ error: `Missing fields in user data: ${missingUserFields.join(', ')}` });
    }

    const constructPrompt = (user_data, crop_data) => {
        let prompt = `
        Height: ${user_data.Height}
        Weight: ${user_data.Weight}
        Activity Level: ${user_data.ActivityLevel}
        Health Goals: ${user_data.HealthGoals}
        Mental Health Goals: ${user_data.MentalHealthGoals}
        Membership: ${user_data.Membership}
        Favourite Ingredients: ${user_data.FavouriteIngredients}
        Disliked Ingredients: ${user_data.DislikedIngredients}

        Available Crops:
    `;
        crop_data.forEach(crop => {
            prompt += `\n- ${crop}`;
        });

        prompt += `\n\nBased on the user's profile, create a 7 day meal plan for week 1 using the top 5 recommended crops taking note of their favourite ingredients.`;

        return prompt;
    };

    const prompt = constructPrompt(user_data, crop_data);

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [{ role: "user", content: prompt }],
            "temperature": 0.7
        });

        console.log(response.choices[0]);

        const recommendations = (response.choices[0]);
        res.json({ recommendations });

    } catch (error) {
        console.error('Error generating recommendations:', error.response ? error.response.data : error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response headers:', error.response.headers);
            console.error('Response data:', error.response.data);
        }
        res.status(500).json({ error: 'Failed to generate recommendations' });
    }
});

app.post('/saverecommendations', async (req, res) => {
    try {
        const { recommendations } = req.body;
        const newRecommendations = new Recommendations({ recommendations });
        await newRecommendations.save();
        res.status(201).json(newRecommendations);
    } catch (error) {
        res.status(500).json({ error: 'Failed to save recommendations' });
    }
});

app.get('/recommendations', async (req, res) => {
    try {
        const recommendations = await Recommendation.find({ user: req.user.id });
        res.json(recommendations);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});