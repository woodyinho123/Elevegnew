// routes/userPlants.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const UserPlant = require('../models/UserPlant');
const Plant = require('../models/Plant');
const schedule = require('node-schedule'); // For scheduling notifications

// Function to schedule the harvest notification
const scheduleHarvestNotification = (plantName, harvestDate) => {
    const reminderDate = new Date(harvestDate);
    reminderDate.setDate(reminderDate.getDate() - 1); // Notify one day before harvest

    console.log(`Mock Notification: Scheduling notification for ${plantName} on ${reminderDate}`);

    // Schedule the job
    schedule.scheduleJob(reminderDate, function () {
        console.log(`Reminder: Your ${plantName} will be ready to harvest tomorrow!`);
        console.log(`Mock notification: Your ${plantName} will be ready to harvest tomorrow on ${reminderDate}`);
        // Here, you could integrate with a notification service like Firebase, Twilio, etc.
    });

    // Return notification details for testing purposes
    return {
        message: `Your ${plantName} will be ready to harvest tomorrow!`,
        scheduledDate: reminderDate,
    };
};

// Add a new plant to a user's garden
router.post('/', auth, async (req, res) => {
    const { plantId, plantedDate } = req.body;

    try {
        const plant = await Plant.findById(plantId);
        if (!plant) {
            return res.status(404).json({ msg: 'Plant not found' });
        }

        const growthDuration = plant.growthDuration;
        const expectedHarvestDate = new Date(new Date(plantedDate).getTime() + growthDuration * 24 * 60 * 60 * 1000);

        const userPlant = new UserPlant({
            userId: req.user.id,
            plantId,
            plantedDate,
            expectedHarvestDate
        });

        // Schedule the notification (mock)
        const notificationDetails = scheduleHarvestNotification(plant.crop, expectedHarvestDate);

        await userPlant.save();

        // Return the user plant and notification details for verification
        res.json({ userPlant, notificationDetails });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Get all plants for a user
router.get('/', auth, async (req, res) => {
    try {
        const userPlants = await UserPlant.find({ userId: req.user.id }).populate('plantId');
        res.json(userPlants);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
