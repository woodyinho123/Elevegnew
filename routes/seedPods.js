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

// Apply Water to a Seed Pod
router.post('/:userId/pods/:podId/apply-water', async (req, res) => {
    const { userId, podId } = req.params;

    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: "User not found." });

        const pod = user.seedPods.id(podId);
        if (!pod) return res.status(404).json({ error: "Seed pod not found." });

        const today = new Date().toISOString().split('T')[0];
        const lastGrowthDate = pod.lastGrowthDate ? pod.lastGrowthDate.toISOString().split('T')[0] : null;

        let growthToday = (lastGrowthDate === today) ? pod.growthToday : 0;

        if (growthToday + 4 > 10) {
            return res.status(400).json({ error: "Cannot exceed 10 virtual days of growth today." });
        }

        // Apply Water
        pod.growthDays += 4;
        pod.growthToday = growthToday + 4;
        pod.lastGrowthDate = new Date();

        if (pod.growthDays >= 28) pod.status = 'ready';

        await user.save();
        res.json({ message: "Water applied successfully!", updatedPod: pod });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to apply water." });
    }
});

// Apply Fertilizer to a Seed Pod
router.post('/:userId/pods/:podId/apply-fertilizer', async (req, res) => {
    const { userId, podId } = req.params;

    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: "User not found." });

        const pod = user.seedPods.id(podId);
        if (!pod) return res.status(404).json({ error: "Seed pod not found." });

        const today = new Date().toISOString().split('T')[0];
        const lastGrowthDate = pod.lastGrowthDate ? pod.lastGrowthDate.toISOString().split('T')[0] : null;

        let growthToday = (lastGrowthDate === today) ? pod.growthToday : 0;

        if (growthToday + 2 > 10) {
            return res.status(400).json({ error: "Cannot exceed 10 virtual days of growth today." });
        }

        // Apply Fertilizer
        pod.growthDays += 2;
        pod.growthToday = growthToday + 2;
        pod.lastGrowthDate = new Date();

        if (pod.growthDays >= 28) pod.status = 'ready';

        await user.save();
        res.json({ message: "Fertilizer applied successfully!", updatedPod: pod });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to apply fertilizer." });
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
