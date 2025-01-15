//seedpods

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const resetPodDailyUsage = require('../utils/resetPodDailyUsage');
const Transaction = require('../models/Transaction'); // Ensure you have this model

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
router.post('/:userId/pods/:podId/apply-water', async (req, res) => {
    try {
        const { userId, podId } = req.params;

        // Fetch user and pod
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        const pod = user.seedPods.id(podId);
        if (!pod) {
            return res.status(404).json({ error: 'Pod not found.' });
        }

        // Reset daily limits for the pod if necessary
        resetPodDailyUsage(pod);

        // Check daily water usage limit for this pod
        if (pod.dailyWaterUsage + 4 > 8) {
            return res.status(400).json({ error: 'Daily water usage limit (8 virtual days) exceeded for this pod.' });
        }

        // Ensure pod is planted
        if (!pod.planted) {
            return res.status(400).json({ error: 'Pod is not planted. Please plant it first.' });
        }

        // Ensure growthToday + 4 does not exceed 10
        if (pod.growthToday + 4 > 10) {
            return res.status(400).json({ error: 'Exceeded daily growth limit (10 virtual days).' });
        }

        // Apply water
        pod.growthDays += 4;
        pod.growthToday += 4;
        pod.dailyWaterUsage += 4;
        pod.lastUsageDate = new Date();

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



router.post('/:userId/pods/:podId/apply-fertilizer', async (req, res) => {
    try {
        const { userId, podId } = req.params;

        // Fetch user and pod
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        const pod = user.seedPods.id(podId);
        if (!pod) {
            return res.status(404).json({ error: 'Pod not found.' });
        }

        // Reset daily limits for the pod if necessary
        resetPodDailyUsage(pod);

        // Check daily fertilizer usage limit for this pod
        if (pod.dailyFertilizerUsage + 2 > 2) {
            return res.status(400).json({ error: 'Daily fertilizer usage limit (2 virtual days) exceeded for this pod.' });
        }

        // Ensure pod is planted
        if (!pod.planted) {
            return res.status(400).json({ error: 'Pod is not planted. Please plant it first.' });
        }

        // Ensure growthToday + 2 does not exceed 10
        if (pod.growthToday + 2 > 10) {
            return res.status(400).json({ error: 'Exceeded daily growth limit (10 virtual days).' });
        }

        // Apply fertilizer
        pod.growthDays += 2;
        pod.growthToday += 2;
        pod.dailyFertilizerUsage += 2;
        pod.lastUsageDate = new Date();

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

        // Ensure the pod is ready for harvest
        if (pod.status !== 'ready for harvest') {
            return res.status(400).json({ error: "Pod is not ready for harvest." });
        }

        // Update pod status
        pod.status = 'harvested';

        // Award tokens and game score
        user.balance_tokens += 20;
        user.gameScore += 20;

        // Create a transaction record
        const transaction = new Transaction({
            userId: user._id,
            itemId: pod._id, // You can use a specific identifier or item ID if applicable
            timestamp: new Date(),
            amount_tokens: 20,
            quantity: 1, // Represents one harvest
            type: 'harvest' // Optional: to categorize the transaction
        });

        await transaction.save();

        // Save the updated user
        await user.save();

        res.json({ message: "Pod harvested successfully!", harvestedPod: pod });
    } catch (error) {
        console.error('Error harvesting pod:', error);
        res.status(500).json({ error: "Failed to harvest pod." });
    }
});

router.post('/:userId/pods/:podId/plant', async (req, res) => {
    try {
        const { userId, podId } = req.params;

        // Fetch user and validate existence
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: 'User not found.' });

        // Find the seed pod by its ID
        const pod = user.seedPods.id(podId);
        if (!pod) return res.status(404).json({ error: 'Seed pod not found.' });

        // Check if the pod is already planted
        if (pod.planted) return res.status(400).json({ error: 'Pod is already planted.' });

        // DEBUG LOGS
        console.log('Pod:', pod);
        console.log('User Inventory:', user.inventory);

        // Validate `pod.tray` and ensure it exists as a tray in the user's inventory
        const trayId = user.inventory.find(
            (tray) => tray.toString() === '67584902a6d40e00584cdb9d' // Replace with actual ObjectId for trays (9d)
        );

        if (!trayId) {
            console.log(`Tray with ID ${pod.tray} not found in inventory.`);
            return res.status(400).json({ error: 'Invalid tray selected.' });
        }

        // Plant the seed pod
        pod.planted = true;
        pod.status = 'growing';

        await user.save();

        console.log('Pod successfully planted:', pod); // Log successful planting
        res.json({ success: true, message: 'Seed pod planted successfully!', pod });
    } catch (error) {
        console.error('Error planting seed pod:', error);
        res.status(500).json({ error: 'Failed to plant seed pod.' });
    }
});

router.post('/:userId/pods/:podId/assign-tray', async (req, res) => {
    const { userId, podId } = req.params;
    const { trayNumber } = req.body; // Tray number to assign the pod to

    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: 'User not found.' });

        const pod = user.seedPods.id(podId);
        if (!pod) return res.status(404).json({ error: 'Seed pod not found.' });

        const tray = user.trays.find((t) => t.number === trayNumber);
        if (!tray) return res.status(400).json({ error: 'Tray not found or invalid tray number.' });

        // Assign the seed pod to the tray
        pod.tray = tray.number;
        await user.save();

        res.json({ success: true, message: 'Seed pod assigned to tray successfully!', pod });
    } catch (error) {
        console.error('Error assigning seed pod to tray:', error);
        res.status(500).json({ error: 'Failed to assign seed pod to tray.' });
    }
});









module.exports = router;
