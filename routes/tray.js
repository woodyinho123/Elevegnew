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

module.exports = router;
