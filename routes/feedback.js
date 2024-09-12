const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Feedback = require('../models/Feedback');

// Post feedback
router.post('/', auth, async (req, res) => {
    const { responses } = req.body;

    try {
        const newFeedback = new Feedback({
            userId: req.user.id,
            responses
        });

        const feedbackEntry = await newFeedback.save();
        res.json(feedbackEntry);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Get feedback
router.get('/', auth, async (req, res) => {
    try {
        const feedback = await Feedback.find().sort({ date: -1 });
        res.json(feedback);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
