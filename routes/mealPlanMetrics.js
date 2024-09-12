const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const MealPlanMetric = require('../models/MealPlanMetric');
const { calculateNutrientIntake, compareCaloricNeeds, calculateAdherence } = require('../services/mealPlanService');

//const { alignMealPlansWithHealthData } = require('../services/healthDataService');


// Fetch all meal plan metrics for a user
router.get('/metrics', auth, async (req, res) => {
    try {
        const metrics = await MealPlanMetric.find({ userId: req.user.id });
        res.json(metrics);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});
// Fetch specific metric details by ID
router.get('/metrics/:id', auth, async (req, res) => {
    try {
        const metric = await MealPlanMetric.findById(req.params.id);
        if (!metric) {
            return res.status(404).json({ msg: 'Metric not found' });
        }
        res.json(metric);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});





// Create or update meal plan metrics
router.post('/metrics', auth, async (req, res) => {
    const { nutrientIntake, caloricNeeds, adherence } = req.body;

    try {
        let metric = await MealPlanMetric.findOne({ userId: req.user.id });

        if (metric) {
            // Update existing metrics
            metric.nutrientIntake = nutrientIntake || metric.nutrientIntake;
            metric.caloricNeeds = caloricNeeds || metric.caloricNeeds;
            metric.adherence = adherence || metric.adherence;
            await metric.save();
        } else {
            // Create new metrics
            metric = new MealPlanMetric({
                userId: req.user.id,
                nutrientIntake,
                caloricNeeds,
                adherence
            });
            await metric.save();
        }

        res.json(metric);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Update a specific meal plan metric by ID
router.put('/metrics/:id', auth, async (req, res) => {
    const { nutrientIntake, caloricNeeds, adherence } = req.body;

    try {
        let metric = await MealPlanMetric.findById(req.params.id);

        if (!metric) {
            return res.status(404).json({ msg: 'Metric not found' });
        }

        // Update the metric with new values
        metric.nutrientIntake = nutrientIntake || metric.nutrientIntake;
        metric.caloricNeeds = caloricNeeds || metric.caloricNeeds;
        metric.adherence = adherence || metric.adherence;
        metric.updatedAt = Date.now();

        await metric.save();
        res.json(metric);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


module.exports = router;
