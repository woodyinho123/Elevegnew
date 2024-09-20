//routes/recommendations

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');
const OpenAI = require('openai');
const Recommendations = require('../models/Recommendation');
const JournalEntry = require('../models/JournalEntry'); // Import the JournalEntry model
const openai = new OpenAI();

// Helper function to extract insights from journal entries over the last 4 weeks
const extractJournalInsights = async (userId) => {
    // Calculate the date 4 weeks ago from today
    const start = new Date();
    start.setDate(start.getDate() - 28);

    // Find journal entries for the user from the past 4 weeks
    const journalEntries = await JournalEntry.find({
        userId,
        date: { $gte: start } // Entries within the last 4 weeks
    });

    let totalMood = 0;
    let totalEnergy = 0;
    let totalMacros = { calories: 0, protein: 0, carbs: 0, fats: 0 };
    let count = journalEntries.length;

    // Aggregate insights from journal entries
    journalEntries.forEach(entry => {
        totalMood += entry.mood.rating;
        totalEnergy += entry.exercise.energyLevel || 0;
        if (entry.macros.knowMacros) {
            totalMacros.calories += entry.macros.details.calories || 0;
            totalMacros.protein += entry.macros.details.protein || 0;
            totalMacros.carbs += entry.macros.details.carbs || 0;
            totalMacros.fats += entry.macros.details.fats || 0;
        }
    });

    // Calculate averages or other relevant metrics
    const averageMood = count > 0 ? totalMood / count : 0;
    const averageEnergy = count > 0 ? totalEnergy / count : 0;
    const averageMacros = {
        calories: count > 0 ? totalMacros.calories / count : 0,
        protein: count > 0 ? totalMacros.protein / count : 0,
        carbs: count > 0 ? totalMacros.carbs / count : 0,
        fats: count > 0 ? totalMacros.fats / count : 0
    };

    return {
        averageMood,
        averageEnergy,
        averageMacros
    };
};

router.post('/next4weeks', auth, async (req, res) => {
    const { user_data, crop_data } = req.body; // Data from the request body

    try {
        // Step 1: Get journal insights from the past 4 weeks
        const journalInsights = await extractJournalInsights(req.user.id);

        // Step 2: Construct the OpenAI prompt with the gathered data
        const prompt = constructPromptForNextWeeks(user_data, crop_data, journalInsights);

        // Step 3: Call OpenAI to generate the meal plan for the next four weeks
        const response = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7
        });

        // Extract the meal plan from the OpenAI response
        const recommendations = response.choices[0].message.content;

        // Step 4: Parse the response to separate weeks
        const weekPlans = recommendations.split(/Week \d:/); // Split based on "Week" labels
        const week5Plan = weekPlans[1] ? `Week 5:${weekPlans[1].trim()}` : '';
        const week6Plan = weekPlans[2] ? `Week 6:${weekPlans[2].trim()}` : '';
        const week7Plan = weekPlans[3] ? `Week 7:${weekPlans[3].trim()}` : '';
        const week8Plan = weekPlans[4] ? `Week 8:${weekPlans[4].trim()}` : '';

        // Find the user's existing recommendation document or create a new one if not found
        let userRecommendations = await Recommendations.findOne({ userId: req.user.id });

        if (!userRecommendations) {
            // If no existing document, create a new one
            userRecommendations = new Recommendations({
                userId: req.user.id,
                week5: week5Plan,
                week6: week6Plan,
                week7: week7Plan,
                week8: week8Plan
            });
        } else {
            // Update the existing document with new weeks
            userRecommendations.week5 = week5Plan;
            userRecommendations.week6 = week6Plan;
            userRecommendations.week7 = week7Plan;
            userRecommendations.week8 = week8Plan;
        }

        // Save the document (either new or updated)
        await userRecommendations.save();

        // Step 5: Return the generated meal plan
        res.json({ week5: week5Plan, week6: week6Plan, week7: week7Plan, week8: week8Plan });
    } catch (error) {
        console.error('Error generating next 4 weeks recommendations:', error.message);
        res.status(500).json({ error: 'Failed to generate recommendations for the next 4 weeks' });
    }
});




// Helper function to construct the OpenAI prompt for the next 4 weeks of meal plans
const constructPromptForNextWeeks = (user_data, crop_data, journalInsights) => {
    let prompt = `
        User Data:
        Height: ${user_data.Height}
        Weight: ${user_data.Weight}
        Dietary Preferences: ${user_data.DietaryPreferences}
        Activity Level: ${user_data.ActivityLevel}
        Health Goals: ${user_data.HealthGoals}
        Favourite Ingredients: ${user_data.FavouriteIngredients}
        Disliked Ingredients: ${user_data.DislikedIngredients}

        Recent Journal Insights:
        Average Mood: ${journalInsights.averageMood}
        Average Energy Level: ${journalInsights.averageEnergy}
        Average Macros - Calories: ${journalInsights.averageMacros.calories}, Protein: ${journalInsights.averageMacros.protein}, Carbs: ${journalInsights.averageMacros.carbs}, Fats: ${journalInsights.averageMacros.fats}

        Available Crops:
    `;
    crop_data.forEach(crop => {
        prompt += `\n- ${crop}`;
    });

    // Requesting separate meal plans for each week
    prompt += `

    Based on the user's profile and recent journal insights, create four unique 7-day meal plans for the next four weeks. Each week's plan should use a variety of the top 5 recommended crops, take note of the user's dietary preferences, activity level, health goals, and recent journal data. Ensure that each week's plan is different and provides variety. Please format your response as follows:

    Week 5:
    Day 1: Breakfast: [Meal], Lunch: [Meal], Dinner: [Meal]
    Day 2: Breakfast: [Meal], Lunch: [Meal], Dinner: [Meal]
    ...
    Day 7: Breakfast: [Meal], Lunch: [Meal], Dinner: [Meal]

    Week 6:
    Day 1: Breakfast: [Meal], Lunch: [Meal], Dinner: [Meal]
    ...
    (Continue similarly for Week 7 and Week 8)

    Make sure each week's meal plan is distinct and considers the crops, user's preferences, and nutritional goals.`;

    return prompt;
};
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