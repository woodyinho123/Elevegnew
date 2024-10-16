// routes/mealPlan.js

const express = require('express');
const router = express.Router();
const MealPlan = require('../models/MealPlan');
const auth = require('../middleware/auth');
// Add this line to import the Recommendation model
const Recommendation = require('../models/Recommendation');

// Create a new meal plan
router.post('/', auth, async (req, res) => {
    const { userId, week, crops } = req.body;

    try {
        const newMealPlan = new MealPlan({
            userId,
            week,
            crops
        });

        const savedMealPlan = await newMealPlan.save();
        res.json(savedMealPlan);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Get all meal plans
router.get('/', auth, async (req, res) => {
    try {
        const mealPlans = await MealPlan.find();
        res.json(mealPlans);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Get a specific meal plan by week
router.get('/:week', auth, async (req, res) => {
    try {
        const mealPlan = await MealPlan.findOne({ week: req.params.week });
        if (!mealPlan) {
            return res.status(404).json({ msg: 'Meal plan not found' });
        }
        res.json(mealPlan);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Update a meal plan
router.put('/:week', auth, async (req, res) => {
    const { crops } = req.body;

    try {
        const mealPlan = await MealPlan.findOneAndUpdate(
            { week: req.params.week },
            { crops, updatedAt: Date.now() },
            { new: true, upsert: true }
        );
        res.json(mealPlan);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Delete a meal plan
router.delete('/:week', auth, async (req, res) => {
    try {
        const mealPlan = await MealPlan.findOneAndDelete({ week: req.params.week });
        if (!mealPlan) {
            return res.status(404).json({ msg: 'Meal plan not found' });
        }
        res.json({ msg: 'Meal plan deleted' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Get meals for a specific day in a given week
router.get('/:week/:day', auth, async (req, res) => {
    try {
        const { week, day } = req.params;

        // Dynamically construct the week key (e.g., "week1", "week12")
        const weekKey = `week${week}`;

        // Dynamically construct the day key (e.g., "Day 1", "Day 2")
        const dayKey = `Day ${day}`;

        // Find the recommendation document for the user
        const mealPlan = await Recommendation.findOne({ userId: req.user.id });


        // Log the entire meal plan for debugging purposes
        console.log(`Full meal plan: ${JSON.stringify(mealPlan, null, 2)}`);


        if (!mealPlan || !mealPlan[weekKey]) {
            return res.status(404).json({ msg: `Meal plan for week ${week} not found` });
        }

        // Get the meals for the specified day in the specified week
        const mealsForDay = mealPlan[weekKey][dayKey];
        console.log(`Looking for week: ${weekKey}`);
        console.log(`Looking for day: ${dayKey}`);


        if (!mealsForDay) {
            return res.status(404).json({ msg: `No meals found for ${dayKey} in week ${week}` });
        }

        // Return the meals for the specified day
        res.json({ day: dayKey, meals: mealsForDay });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});



module.exports = router;
