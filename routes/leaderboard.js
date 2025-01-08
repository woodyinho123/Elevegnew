//leaderboard


const express = require('express');
const router = express.Router(); // Initialize the router
const auth = require('../middleware/auth'); // Assuming you have an auth middleware
const User = require('../models/User'); // Import the User model





router.post('/register', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ msg: 'User not found' });

        if (user.gameRegistration) {
            return res.status(400).json({ msg: 'User already registered for the game' });
        }

        user.gameRegistration = true;
        await user.save();

        res.json({ msg: 'Successfully registered for the game' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

router.post('/update-score', auth, async (req, res) => {
    const { score } = req.body;

    try {
        const user = await User.findById(req.user.id);
        if (!user || !user.gameRegistration) {
            return res.status(400).json({ msg: 'User is not registered for the game' });
        }

        user.gameScore += score; // Increment the score
        await user.save();

        res.json({ msg: 'Score updated', gameScore: user.gameScore });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

router.get('/leaderboard', async (req, res) => {
    try {
        const topPlayers = await User.find({ gameRegistration: true })
            .sort({ gameScore: -1 }) // Sort by score descending
            .limit(10)
            .select('username gameScore'); // Select only relevant fields

        res.json(topPlayers);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router; // Export router