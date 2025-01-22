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

        //// Ensure growthToday + 4 does not exceed 10
        if (pod.growthToday + 4 > 10) {
            return res.status(400).json({ error: 'Exceeded daily growth limit (10 virtual days).' });
        }

        //// Apply water
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

        //// Ensure growthToday + 2 does not exceed 10
        if (pod.growthToday + 2 > 10) {
            return res.status(400).json({ error: 'Exceeded daily growth limit (10 virtual days).' });
        }

        //// Apply fertilizer
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

        // Assign Fertilizer (if applicable)
        const fertilizer = await Fertilizer.findOne({ userId: user._id, expired: false }).sort({ purchasedAt: 1 }); // FIFO
        if (!fertilizer) {
            return res.status(400).json({ error: 'No available fertilizer. Please purchase more.' });
        }

        fertilizer.usesRemaining -= 1;
        if (fertilizer.usesRemaining <= 0) {
            fertilizer.expired = true;
        }

        fertilizer.usesRemaining -= 1;
        if (fertilizer.usesRemaining <= 0) {
            fertilizer.expired = true;
        }

        // Increment harvested pods count for fertilizer
        fertilizer.harvestedPodsCount += 1;

        // If 14 pods have been harvested, expire the fertilizer
        if (fertilizer.harvestedPodsCount >= 14) {
            fertilizer.expired = true;
        }

        await fertilizer.save();

        // Update pod status
        pod.status = 'harvested';

        // Award tokens and game score (base 20)
        user.balance_tokens += 20;
        user.gameScore += 20;

        // Check if the user has purchased a solar panel and award extra tokens and score
        const solarPanelItem = await Item.findOne({ name: 'Solar Panel' });
        const hasSolarPanel = user.inventory.includes(solarPanelItem._id.toString());

        if (hasSolarPanel) {
            user.balance_tokens += 25;  // Additional 25 tokens
            user.gameScore += 25;       // Additional 25 score
        }

        // Create a transaction record for the harvest
        const transaction = new Transaction({
            userId: user._id,
            itemId: pod._id, // You can use a specific identifier or item ID if applicable
            timestamp: new Date(),
            amount_tokens: 25, // The extra tokens for the solar panel
            quantity: 1,
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

// routes/seedPods.js
router.post('/:userId/pods/:podId/assign-tray', async (req, res) => {
    const { userId, podId } = req.params;
    // Now we also accept a “position” number in the request body
    const { trayNumber, position } = req.body;

    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: 'User not found.' });

        const pod = user.seedPods.id(podId);
        if (!pod) return res.status(404).json({ error: 'Seed pod not found.' });

        // Check if this tray actually exists on the user
        const tray = user.trays.find((t) => t.number === trayNumber);
        if (!tray) {
            return res.status(400).json({ error: 'Tray not found or invalid tray number.' });
        }

        // Optional: validate the position is within 1..14, if that’s your tray size
        if (position < 1 || position > 14) {
            return res.status(400).json({ error: 'Position must be between 1 and 14.' });
        }

        // Make sure no other pod on the same tray is already occupying that position
        const conflict = user.seedPods.find(p =>
            p._id.toString() !== podId &&      // Not the same pod
            p.tray === trayNumber &&
            p.position === position
        );
        if (conflict) {
            return res.status(400).json({ error: 'That position is already occupied by another seed pod.' });
        }

        // Assign the tray and position
        pod.tray = trayNumber;
        pod.position = position;

        await user.save();
        res.json({ success: true, message: 'Seed pod assigned to tray & position!', pod });
    } catch (error) {
        console.error('Error assigning seed pod to tray/position:', error);
        res.status(500).json({ error: 'Failed to assign seed pod to tray/position.' });
    }
});


router.get('/:userId/pods/by-tray/:trayNumber', async (req, res) => {
    const { userId, trayNumber } = req.params;

    try {
        // Fetch the user document
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        // Fetch all pods belonging to the specified tray number
        const podsInTray = user.seedPods.filter(pod => pod.tray === parseInt(trayNumber));

        // If no pods are found for the tray number, return a message
        if (podsInTray.length === 0) {
            return res.status(404).json({ error: `No pods found for tray number ${trayNumber}.` });
        }

        // Return the pods associated with the tray
        res.json({ pods: podsInTray });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch pods by tray number.' });
    }
});








module.exports = router;
