// routes/mealPlan.js

const express = require('express');
const router = express.Router();
const MealPlan = require('../models/MealPlan');
const auth = require('../middleware/auth');

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

module.exports = router;
