const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Fetch all seed pods for a user
router.get('/:userId/pods', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) return res.status(404).json({ error: "User not found." });

        res.json({ seedPods: user.seedPods });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch seed pods." });
    }
});
// Apply water to a seed pod
router.post('/:userId/pods/:podId/apply-water', async (req, res) => {
    const { userId, podId } = req.params;

    try {
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        const pod = user.seedPods.id(podId);

        if (!pod) {
            return res.status(404).json({ error: 'Seed pod not found.' });
        }

        // Calculate the new growth
        const now = new Date();
        const lastGrowthDate = pod.lastGrowthDate || new Date(0); // Default to epoch if null
        const isNewDay = now.toDateString() !== lastGrowthDate.toDateString();

        if (isNewDay) {
            // Reset growthToday on a new real-life day
            pod.growthToday = 0;
            pod.lastGrowthDate = now;
        }

        // Check if the virtual day limits are exceeded
        if (pod.growthToday + 4 > 10) {
            return res.status(400).json({ error: 'You cannot exceed 10 virtual days of growth today.' });
        }

        if (pod.growthDays + 4 > 10) {
            return res.status(400).json({ error: 'Total growth cannot exceed 10 days per real-life day.' });
        }

        // Increment growth
        pod.growthToday += 4;
        pod.growthDays += 4;

        // Save user data
        await user.save();

        res.json({ message: 'Water applied successfully.', pod });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while applying water.' });
    }
});

// Apply Fertilizer Route
router.post('/:userId/pods/:podId/apply-fertilizer', async (req, res) => {
    try {
        const { userId, podId } = req.params;

        // Fetch user and locate the pod
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        const pod = user.seedPods.id(podId); // Use subdocument querying
        if (!pod) {
            return res.status(404).json({ error: 'Pod not found.' });
        }

        // Ensure growthToday + 2 does not exceed 10
        if (pod.growthToday + 2 > 10) {
            return res.status(400).json({ error: 'Exceeded daily growth limit (10 virtual days).' });
        }

        // Apply 2 virtual days of growth
        pod.growthDays += 2;
        pod.growthToday += 2;
        pod.lastGrowthDate = new Date();

        // Check if pod is ready for harvest
        if (pod.growthDays >= 28) {
            pod.status = 'ready for harvest';
        }

        // Save user document
        await user.save();

        res.json({ success: true, message: 'Fertilizer applied successfully!', pod });
    } catch (error) {
        console.error('Error applying fertilizer:', error);
        res.status(500).json({ error: 'Failed to apply fertilizer.' });
    }
});


// Harvest Seed Pod
router.post('/:userId/pods/:podId/harvest', async (req, res) => {
    const { userId, podId } = req.params;

    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: "User not found." });

        const pod = user.seedPods.id(podId);
        if (!pod) return res.status(404).json({ error: "Seed pod not found." });

        if (pod.status !== 'ready') {
            return res.status(400).json({ error: "Pod is not ready for harvest." });
        }

        pod.status = 'harvested';
        await user.save();

        res.json({ message: "Pod harvested successfully!", harvestedPod: pod });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to harvest pod." });
    }
});

module.exports = router;
