// routes/tray.js

const express = require('express');
const router = express.Router();
const Tray = require('../models/Tray');
const auth = require('../middleware/auth');

// Create a new tray with pods
router.post('/', auth, async (req, res) => {
    const { trayId, podData } = req.body;

    try {
        const newTray = new Tray({
            trayId,
            podData
        });

        const savedTray = await newTray.save();
        res.json(savedTray);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Get all trays
router.get('/', auth, async (req, res) => {
    try {
        const trays = await Tray.find();
        res.json(trays);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Get a specific tray by ID
router.get('/:trayId', auth, async (req, res) => {
    try {
        const tray = await Tray.findOne({ trayId: req.params.trayId });
        if (!tray) {
            return res.status(404).json({ msg: 'Tray not found' });
        }
        res.json(tray);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});


// Get crops for a specific day in a given week
router.get('/:week/:day', auth, async (req, res) => {
    try {
        const { week, day } = req.params;
        const userId = req.user.id;

        // Find the tray for the specified week
        const tray = await Tray.findOne({ userId, trayId: `Tray${week}-${userId}` });

        if (!tray) {
            return res.status(404).json({ msg: 'Tray not found' });
        }

        // Check if the day is valid
        if (day < 1 || day > 7) {
            return res.status(400).json({ msg: 'Invalid day. Day must be between 1 and 7.' });
        }

        // Extract the pod data for the specified day (assuming pods are evenly distributed across the week)
        const cropsForDay = tray.podData.slice((day - 1) * (tray.podData.length / 7), day * (tray.podData.length / 7));

        // Return the crops for the specified day
        res.json(cropsForDay);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Update a tray
router.put('/:trayId', auth, async (req, res) => {
    const { podData } = req.body;

    try {
        const tray = await Tray.findOneAndUpdate(
            { trayId: req.params.trayId },
            { podData, updatedAt: Date.now() },
            { new: true, upsert: true }
        );
        res.json(tray);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Delete a tray
router.delete('/:trayId', auth, async (req, res) => {
    try {
        const tray = await Tray.findOneAndDelete({ trayId: req.params.trayId });
        if (!tray) {
            return res.status(404).json({ msg: 'Tray not found' });
        }
        res.json({ msg: 'Tray deleted' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Fetch crops for a specific day in a given week
router.get('/week/:weekNumber/day/:dayNumber', auth, async (req, res) => {
    try {
        const { weekNumber, dayNumber } = req.params;
        const userId = req.user.id;

        // Validate that week and day numbers are in a valid range
        if (dayNumber < 1 || dayNumber > 7) {
            return res.status(400).json({ error: 'Invalid day number. It must be between 1 and 7.' });
        }

        // Construct the tray ID based on the week number and user ID
        const trayId = `Tray${weekNumber}-${userId}`;

        // Find the user's tray for the specified week
        const tray = await Tray.findOne({ userId, trayId });
        if (!tray) {
            return res.status(404).json({ error: `Tray not found for user ${userId} in week ${weekNumber}.` });
        }

        // Calculate the start and end index based on the day number
        const podsPerDay = Math.ceil(tray.podData.length / 7); // Assuming evenly distributed pods for each day
        const startIndex = (dayNumber - 1) * podsPerDay;
        const endIndex = startIndex + podsPerDay;

        // Get the crops for the specific day
        const cropsForDay = tray.podData.slice(startIndex, endIndex).map(pod => pod.cropType);

        // Respond with the crop types for the specified day
        res.json({
            week: weekNumber,
            day: dayNumber,
            crops: cropsForDay
        });
    } catch (err) {
        console.error('Error fetching crop types for specific day:', err.message);
        res.status(500).json({ error: 'Failed to fetch crops for the specified day.' });
    }
});

module.exports = router;
