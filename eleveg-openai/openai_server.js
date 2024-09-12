//eleveg-openai/openai_server

const express = require('express');
const bodyParser = require('body-parser');
const OpenAI = require('openai');
const mongoose = require('mongoose');
const auth = require('./middleware/auth'); // Ensure the auth middleware path is correct

const app = express();
const PORT = process.env.PORT || 5000;

mongoose
    .connect('mongodb+srv://eleveg10:eleveg@cluster0.z9ghmo4.mongodb.net/', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.error('MongoDB connection error:', err));

const recommendationsSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    week1: {
        meals: { type: String, required: true },
        recommendedCrops: { type: String, required: true },
    },
    week2: {
        meals: { type: String, required: true },
        recommendedCrops: { type: String, required: true },
    },
    week3: {
        meals: { type: String, required: true },
        recommendedCrops: { type: String, required: true },
    },
    week4: {
        meals: { type: String, required: true },
        recommendedCrops: { type: String, required: true },
    },
});

const Recommendation = mongoose.model('Recommendation', recommendationsSchema);

app.use(bodyParser.json());

const openai = new OpenAI();

const constructPrompt = (user_data, crop_data, weekNumber) => {
    let prompt = `
        Age: ${user_data.Age}
        Gender: ${user_data.Gender}
        Weight: ${user_data.Weight}
        Height: ${user_data.Height}
        Allergies: ${user_data.Allergies}
        Fitness Routine: ${user_data.FitnessRoutine}
        Nutritional Quality: ${user_data.NutritionalQuality}
        Health Goals: ${user_data.HealthGoals}
        FavouriteMeals: ${user_data.FavouriteMeals}
        Likes Juice or Herbal Tea: ${user_data.LikesJuiceHerbalTea}
        Cuisine Preferences: ${user_data.cuisinePreferences.join(', ')}
        Special Dietary Requirements: ${user_data.specialDietaryRequirements.join(', ')}
        Cultural Diets: ${user_data.culturalDiets.join(', ')}
        Chef Inspired Menus: ${user_data.chefInspiredMenus.join(', ')}
        Seasonal Inspired Menus: ${user_data.seasonalInspiredMenus}

        Available Crops:
  `;
    crop_data.forEach(crop => {
        prompt += `\n- ${crop}`;
    });

    prompt += `\n\nBased on the user's profile, create a 7 day meal plan for week ${weekNumber} using the top 5 recommended crops taking note of their favourite meals.`;

    return prompt;
};

app.post('/generaterecommendations', auth, async (req, res) => {
    const { user_data, crop_data } = req.body;

    if (!user_data || !crop_data) {
        return res.status(400).json({ error: 'User data and crop data are required' });
    }

    try {
        let recommendations = {};
        for (let week = 1; week <= 4; week++) {
            const prompt = constructPrompt(user_data, crop_data, week);
            const response = await openai.chat.completions.create({
                model: "gpt-4o",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.7
            });

            const meals = response.choices[0].text.trim().split('\n').map(meal => meal.trim());
            const recommendedCrops = crop_data.slice(0, 5); // Assuming top 5 crops

            recommendations[`week${week}`] = {
                meals: meals.join('\n'),
                recommendedCrops: recommendedCrops.join('\n')
            };
        }

        const newRecommendation = new Recommendation({
            user: req.user.id,
            ...recommendations
        });

        const savedRecommendation = await newRecommendation.save();
        res.status(201).json(savedRecommendation);
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

app.post('/saveRecommendations', auth, async (req, res) => {
    const { week1, week2, week3, week4 } = req.body;

    try {
        const newRecommendation = new Recommendation({
            user: req.user.id,
            week1: {
                meals: week1.meals.join('\n'),
                recommendedCrops: week1.recommendedCrops.join('\n')
            },
            week2: {
                meals: week2.meals.join('\n'),
                recommendedCrops: week2.recommendedCrops.join('\n')
            },
            week3: {
                meals: week3.meals.join('\n'),
                recommendedCrops: week3.recommendedCrops.join('\n')
            },
            week4: {
                meals: week4.meals.join('\n'),
                recommendedCrops: week4.recommendedCrops.join('\n')
            }
        });

        const recommendation = await newRecommendation.save();
        res.status(201).json(recommendation);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

app.get('/recommendations', auth, async (req, res) => {
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
