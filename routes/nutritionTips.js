const express = require('express');
const router = express.Router();
const NutritionTip = require('../models/NutritionTip');
const auth = require('../middleware/auth'); // Optional, depending on whether you want to protect these routes

// @route   POST api/nutrition-tips
// @desc    Create a new nutrition tip
// @access  Public (or Private if using auth middleware)
router.post('/', async (req, res) => {
    const { name, nutrients, benefits, growingTips, seedToHarvest } = req.body;

    try {
        const newTip = new NutritionTip({
            name,
            nutrients,
            benefits,
            growingTips,
            seedToHarvest
        });

        const tip = await newTip.save();
        res.status(201).json(tip);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET api/nutrition-tips
// @desc    Get all nutrition tips
// @access  Public (or Private if using auth middleware)
router.get('/', async (req, res) => {
    try {
        const tips = await NutritionTip.find();
        res.json(tips);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
