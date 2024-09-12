const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Notification = require('../models/Notification');

// Get all notifications for the logged-in user
router.get('/', auth, async (req, res) => {
    try {
        const notifications = await Notification.find({ userId: req.user.id }).sort({ date: -1 });
        res.json(notifications);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Create a new notification
router.post('/', auth, async (req, res) => {
    const { type, message, date } = req.body;

    try {
        const newNotification = new Notification({
            userId: req.user.id,
            type,
            message,
            date
        });

        const notification = await newNotification.save();
        res.json(notification);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Mark a notification as read
router.put('/:id/read', auth, async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);
        if (!notification) {
            return res.status(404).json({ msg: 'Notification not found' });
        }

        if (notification.userId.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        notification.read = true;
        await notification.save();

        res.json(notification);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
