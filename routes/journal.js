// routes/journal.js

const express = require('express');
const router = express.Router();
const JournalEntry = require('../models/JournalEntry'); // Import the JournalEntry model
const auth = require('../middleware/auth'); // Middleware to authenticate users

// Helper function to get the start and end of the current month
const getMonthRange = () => {
    const start = new Date();
    start.setDate(1); // Set to the first day of the month
    start.setHours(0, 0, 0, 0); // Set time to the start of the day

    const end = new Date(start);
    end.setMonth(end.getMonth() + 1); // Move to the next month
    end.setDate(0); // Set to the last day of the current month
    end.setHours(23, 59, 59, 999); // Set time to the end of the day

    return { start, end };
};


// Create a new journal entry for the logged-in user
router.post('/add', auth, async (req, res) => {
    const {
        alcohol, caffeine, lateNightFood, water, sleep,
        exercise, homeGrownFood, macros, mood, observations
    } = req.body;

    try {
        const { start, end } = getMonthRange();

        // Count the user's journal entries for the current month
        const entryCount = await JournalEntry.countDocuments({
            userId: req.user.id,
            date: { $gte: start, $lte: end }
        });

        // Check if the user has reached the monthly limit
        if (entryCount >= 31) {
            return res.status(400).json({ error: 'You have reached the maximum of 31 journal entries for this month.' });
        }




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
