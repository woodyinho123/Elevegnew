//routes/recommendations

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');
const OpenAI = require('openai');
const Recommendations = require('../models/Recommendation');

const openai = new OpenAI();

// Endpoint to save recommendations
router.post('/week1', auth, async (req, res) => {
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
    const requiredUserFields = ['Height', 'Weight', 'FavouriteIngredients', 'DislikedIngredients', 'DietaryPreferences', 'ActivityLevel', 'HealthGoals', 'MentalHealthGoals', 'Membership'];
    const missingUserFields = requiredUserFields.filter(field => !(field in user_data));
    if (missingUserFields.length > 0) {
        return res.status(400).json({ error: `Missing fields in user data: ${missingUserFields.join(', ')}` });
    }

    const constructPrompt = (user_data, crop_data) => {
        let prompt = `
        Height: ${user_data.Height}
        Weight: ${user_data.Weight}
        Dietary Preferences: ${user_data.DietaryPreferences}
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
        crop_data.forEach(crop => {
            prompt += `\n- ${crop}`;
        });

        prompt += `\n\nBased on the user's profile, create a 7 day meal plan for the 1st week using the top 5 recommended crops taking note of their dietary preferences, activity level, health goals, mental health goals, favourite/disliked ingredients.`;

        return prompt;
    };

    const prompt = constructPrompt(user_data, crop_data);

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7
        });

        console.log(response.choices[0]);

        const recommendations = (response.choices[0].message.content);
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

router.post('/week2', auth, async (req, res) => {
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
    const requiredUserFields = ['Height', 'Weight', 'FavouriteIngredients', 'DislikedIngredients', 'DietaryPreferences', 'ActivityLevel', 'HealthGoals', 'MentalHealthGoals', 'Membership'];
    const missingUserFields = requiredUserFields.filter(field => !(field in user_data));
    if (missingUserFields.length > 0) {
        return res.status(400).json({ error: `Missing fields in user data: ${missingUserFields.join(', ')}` });
    }

    const constructPrompt = (user_data, crop_data) => {
        let prompt = `
        Height: ${user_data.Height}
        Weight: ${user_data.Weight}
        Dietary Preferences: ${user_data.DietaryPreferences}
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
        crop_data.forEach(crop => {
            prompt += `\n- ${crop}`;
        });

        prompt += `\n\nBased on the user's profile, create a 7 day meal plan for the 2nd week using the top 5 recommended crops taking note of their dietary preferences, activity level, health goals, mental health goals, favourite/disliked ingredients.`;

        return prompt;
    };

    const prompt = constructPrompt(user_data, crop_data);

    try {
        const response2 = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7
        });

        console.log(response2.choices[0]);

        const recommendations = (response2.choices[0].message.content);
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

router.post('/week3', auth, async (req, res) => {
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
    const requiredUserFields = ['Height', 'Weight', 'FavouriteIngredients', 'DislikedIngredients', 'DietaryPreferences', 'ActivityLevel', 'HealthGoals', 'MentalHealthGoals', 'Membership'];
    const missingUserFields = requiredUserFields.filter(field => !(field in user_data));
    if (missingUserFields.length > 0) {
        return res.status(400).json({ error: `Missing fields in user data: ${missingUserFields.join(', ')}` });
    }

    const constructPrompt = (user_data, crop_data) => {
        let prompt = `
        Height: ${user_data.Height}
        Weight: ${user_data.Weight}
        Dietary Preferences: ${user_data.DietaryPreferences}
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
        crop_data.forEach(crop => {
            prompt += `\n- ${crop}`;
        });

        prompt += `\n\nBased on the user's profile, create a 7 day meal plan for the 3rd week using the top 5 recommended crops taking note of their dietary preferences, activity level, health goals, mental health goals, favourite/disliked ingredients.`;

        return prompt;
    };

    const prompt = constructPrompt(user_data, crop_data);

    try {
        const response3 = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7
        });

        console.log(response3.choices[0]);

        const recommendations = (response3.choices[0].message.content);
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

router.post('/week4', auth, async (req, res) => {
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
    const requiredUserFields = ['Height', 'Weight', 'FavouriteIngredients', 'DislikedIngredients', 'DietaryPreferences', 'ActivityLevel', 'HealthGoals', 'MentalHealthGoals', 'Membership'];
    const missingUserFields = requiredUserFields.filter(field => !(field in user_data));
    if (missingUserFields.length > 0) {
        return res.status(400).json({ error: `Missing fields in user data: ${missingUserFields.join(', ')}` });
    }

    const constructPrompt = (user_data, crop_data) => {
        let prompt = `
        Height: ${user_data.Height}
        Weight: ${user_data.Weight}
        Dietary Preferences: ${user_data.DietaryPreferences}
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
        crop_data.forEach(crop => {
            prompt += `\n- ${crop}`;
        });

        prompt += `\n\nBased on the user's profile, create a 7 day meal plan for the 4th week using the top 5 recommended crops taking note of their dietary preferences, activity level, health goals, mental health goals, favourite/disliked ingredients.`;

        return prompt;
    };

    const prompt = constructPrompt(user_data, crop_data);

    try {
        const response4 = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7
        });

        console.log(response4.choices[0]);

        const recommendations = (response4.choices[0].message.content);
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

router.post('/saverecommendations', auth, async (req, res) => {
    try {
        const { week1, week2, week3, week4 } = req.body;
        const newRecommendations = new Recommendations({
            userId: req.user.id,
            week1,
            week2,
            week3,
            week4
        });

        const saveRecommendations = await newRecommendations.save();       
        res.json(saveRecommendations);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

router.get('/', auth, async (req, res) => {
    try {
        const recommendations = await Recommendations.find();
        res.json(recommendations);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

router.get('/me', auth, async (req, res) => {
    try {
        const userId = req.user.id; 

        const recommendations = await Recommendations.find({ userId: userId });

        console.log('Fetched recommendations for user:', userId);
        res.json(recommendations);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;