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
// Apply Water Route
router.post('/:userId/pods/:podId/apply-water', async (req, res) => {
    try {
        const { userId, podId } = req.params;

        // Fetch user and seed pod
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        const pod = user.seedPods.id(podId);
        if (!pod) {
            return res.status(404).json({ error: 'Pod not found.' });
        }

        // Ensure the pod is planted
        if (!pod.planted) {
            return res.status(400).json({ error: 'Pod is not planted. Please plant it first.' });
        }

        // Ensure growthToday + 4 does not exceed 10
        if (pod.growthToday + 4 > 10) {
            return res.status(400).json({ error: 'Exceeded daily growth limit (10 virtual days).' });
        }

        // Apply 4 virtual days of growth
        pod.growthDays += 4;
        pod.growthToday += 4;
        pod.lastGrowthDate = new Date();

        // Check if pod is ready for harvest
        if (pod.growthDays >= 28) {
            pod.status = 'ready for harvest';
        }

        await user.save();
        res.json({ success: true, message: 'Water applied successfully!', pod });
    } catch (error) {
        console.error('Error applying water:', error);
        res.status(500).json({ error: 'Failed to apply water.' });
    }
});


// Apply Fertilizer Route
router.post('/:userId/pods/:podId/apply-fertilizer', async (req, res) => {
    try {
        const { userId, podId } = req.params;

        // Fetch user and seed pod
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        const pod = user.seedPods.id(podId);
        if (!pod) {
            return res.status(404).json({ error: 'Pod not found.' });
        }

        // Ensure the pod is planted
        if (!pod.planted) {
            return res.status(400).json({ error: 'Pod is not planted. Please plant it first.' });
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

// Plant Seed Pod Route
router.post('/:userId/pods/:podId/plant', async (req, res) => {
    try {
        const { userId, podId } = req.params;

        // Find the user and the seed pod
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        const pod = user.seedPods.id(podId);
        if (!pod) {
            return res.status(404).json({ error: 'Pod not found.' });
        }

        // Check if already planted
        if (pod.planted) {
            return res.status(400).json({ error: 'Pod is already planted.' });
        }

        // Plant the seed pod
        pod.planted = true;
        pod.status = 'growing';
        await user.save();

        res.json({ success: true, message: 'Seed pod successfully planted!', pod });
    } catch (error) {
        console.error('Error planting seed pod:', error);
        res.status(500).json({ error: 'Failed to plant seed pod.' });
    }
});


module.exports = router;
