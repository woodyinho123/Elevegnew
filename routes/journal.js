// routes/journal.js

const express = require('express');
const router = express.Router();
const JournalEntry = require('../models/JournalEntry'); // Import the JournalEntry model
const auth = require('../middleware/auth'); // Middleware to authenticate users

// Create a new journal entry for the logged-in user
router.post('/add', auth, async (req, res) => {
    const {
        alcohol, caffeine, lateNightFood, water, sleep,
        exercise, homeGrownFood, macros, mood, observations
    } = req.body;

    try {
        // Create a new journal entry
        const newEntry = new JournalEntry({
            userId: req.user.id,  // Automatically associate the journal entry with the logged-in user
            alcohol,
            caffeine,
            lateNightFood,
            water,
            sleep,
            exercise,
            homeGrownFood,
            macros,
            mood,
            observations
        });

        // Save the journal entry in the database
        const savedEntry = await newEntry.save();
        res.status(201).json(savedEntry);
    } catch (error) {
        console.error('Error saving journal entry:', error.message);
        res.status(500).json({ error: 'Failed to save journal entry' });
    }
});

// Route to get all journal entries for a user
router.get('/entries', auth, async (req, res) => {
    try {
        const entries = await JournalEntry.find({ userId: req.user.id }).sort({ date: -1 });
        res.json(entries);
    } catch (error) {
        console.error('Error fetching journal entries:', error.message);
        res.status(500).json({ error: 'Failed to fetch journal entries' });
    }
});

module.exports = router;
