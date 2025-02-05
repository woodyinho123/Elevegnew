//seedpods

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const resetPodDailyUsage = require('../utils/resetPodDailyUsage');
const Transaction = require('../models/Transaction'); // Ensure you have this model
const Fertilizer = require('../models/Fertilizer');

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

        //// Check daily water usage limit for this pod
        if (pod.dailyWaterUsage + 4 > 8) {
            return res.status(400).json({ error: 'Daily water usage limit (8 virtual days) exceeded for this pod.' });
        }

        // Ensure pod is planted
        if (!pod.planted) {
            return res.status(400).json({ error: 'Pod is not planted. Please plant it first.' });
        }

        ////// Ensure growthToday + 4 does not exceed 10
        if (pod.growthToday + 4 > 10) {
            return res.status(400).json({ error: 'Exceeded daily growth limit (10 virtual days).' });
        }

        ////// Apply water
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

        // Track fertilizer application (don't decrement `usesRemaining` here)
        pod.fertilizerAppliedOnPod = true; // Track that fertilizer was applied

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

        // Fetch available fertilizer (FIFO: First In First Out)
        const fertilizer = await Fertilizer.findOne({ userId: user._id, expired: false }).sort({ purchasedAt: 1 });
        if (!fertilizer) {
            return res.status(400).json({ error: 'No available fertilizer. Please purchase more.' });
        }

        // Check if fertilizer was applied to this pod before decrementing uses
        if (pod.fertilizerAppliedOnPod) {
            fertilizer.usesRemaining -= 1;
            if (fertilizer.usesRemaining <= 0) {
                fertilizer.expired = true;
            }
        }

        // Increment harvested pods count for fertilizer
        fertilizer.harvestedPodsCount += 1;
        if (fertilizer.harvestedPodsCount >= 14) {
            fertilizer.expired = true;
        }

        await fertilizer.save();

        // Update pod status to 'harvested'
        pod.status = 'harvested';

        // Award tokens and game score (base 20)
        user.balance_tokens += 20;
        user.gameScore += 20;

        // ---------- SOLAR PANEL LOGIC START ----------
        // Check if the tray for this pod has an *assigned* solar panel and if all 14 pods are harvested.

        const trayNumber = pod.tray;
        const tray = user.trays.find(t => t.number === trayNumber);

        if (tray && tray.solarPanel && !tray.solarPanelExpired) {
            // Count how many pods in this tray are 'harvested'
            const podsInTray = user.seedPods.filter(p => p.tray === trayNumber);
            const harvestedCount = podsInTray.filter(p => p.status === 'harvested').length;

            // If the tray has exactly 14 pods and all are harvested
            if (harvestedCount === 14) {
                // Award the user 350 tokens & score
                user.balance_tokens += 350;
                user.gameScore += 350;

                // Mark the solar panel as expired
                tray.solarPanelExpired = true;

                // Optionally remove the solarPanel reference so the tray is "free"
                tray.solarPanel = null;

                // Optionally, create a transaction record for the 350
                const solarBonusTransaction = new Transaction({
                    userId: user._id,
                    itemId: tray.solarPanel, // or some placeholder if you want
                    timestamp: new Date(),
                    amount_tokens: 350,
                    quantity: 1,
                    type: 'solar-harvest-bonus'
                });
                await solarBonusTransaction.save();

                console.log(`Tray ${trayNumber} harvested all 14 pods. Solar panel expired. Awarded 350 tokens & score.`);
            }
        }
        // ---------- SOLAR PANEL LOGIC END ----------

        // ---------- WINDMILL LOGIC START ----------
        if (tray && tray.windmill && !tray.windmillExpired) {
            // Count how many pods in this tray are 'harvested'
            const podsInTray = user.seedPods.filter(p => p.tray === trayNumber);
            const harvestedCount = podsInTray.filter(p => p.status === 'harvested').length;

            // If the tray has exactly 14 pods and all are harvested
            if (harvestedCount === 14) {
                // Increment the full tray harvest count
                tray.totalHarvests = (tray.totalHarvests || 0) + 1;

                // If this tray has been fully harvested 5 times (70 pods), expire the windmill
                if (tray.totalHarvests === 5) {
                    // Award the user 350 tokens & score
                    user.balance_tokens += 350;
                    user.gameScore += 350;

                    // Mark the windmill as expired
                    tray.windmillExpired = true;
                    tray.windmill = null;

                    // Optionally, create a transaction record for the 350
                    const windmillBonusTransaction = new Transaction({
                        userId: user._id,
                        itemId: tray.windmill, // or some placeholder if you want
                        timestamp: new Date(),
                        amount_tokens: 350,
                        quantity: 1,
                        type: 'windmill-harvest-bonus'
                    });
                    await windmillBonusTransaction.save();

                    console.log(`Tray ${trayNumber} harvested all 70 pods. Windmill expired. Awarded 350 tokens & score.`);
                }
            }
        }
        // ---------- WINDMILL LOGIC END ----------

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
        // Right here, read trayNumber from req.body
        const { trayNumber } = req.body;

        // Fetch user and validate existence
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: 'User not found.' });

        // Find the seed pod by its ID
        const pod = user.seedPods.id(podId);
        if (!pod) return res.status(404).json({ error: 'Seed pod not found.' });

        // Remove the old hard-coded check for tray in `inventory`
        // and replace it with something like:
        const tray = user.trays.find((t) => t.number === parseInt(trayNumber));
        if (!tray) {
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


// Route to clear all pods from a specific tray
router.post('/:userId/clear-tray/:trayNumber', async (req, res) => {
    const { userId, trayNumber } = req.params;

    try {
        // Fetch the user document
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        // Find all pods in the specified tray
        const podsInTray = user.seedPods.filter(pod => pod.tray === parseInt(trayNumber));

        // If no pods are found for the tray, return a message
        if (podsInTray.length === 0) {
            return res.status(404).json({ error: `No pods found in tray number ${trayNumber}.` });
        }

        // Clear the tray: set tray and position to null for each pod
        podsInTray.forEach(pod => {
            pod.tray = null;
            pod.position = null;
        });

        // Save the updated user document with cleared pods
        await user.save();

        // Respond with a success message
        res.json({ success: true, message: `Tray ${trayNumber} cleared successfully.` });
    } catch (error) {
        console.error('Error clearing tray:', error);
        res.status(500).json({ error: 'Failed to clear tray.' });
    }
});

//// POST /api/seedPods/:userId/trays/:trayNumber/assign-solar-panel
//router.post('/:userId/trays/:trayNumber/assign-solar-panel', async (req, res) => {
//    const { userId, trayNumber } = req.params;
//    const { solarPanelId } = req.body; // the ID of the solar panel in the user's inventory

//    try {
//        // 1) Fetch User
//        const user = await User.findById(userId);
//        if (!user) {
//            return res.status(404).json({ error: 'User not found.' });
//        }

//        // 2) Find the tray
//        const tray = user.trays.find((t) => t.number === parseInt(trayNumber));
//        if (!tray) {
//            return res.status(400).json({ error: 'Tray not found.' });
//        }

//        // 3) Check if user owns the solar panel (assuming we keep them in user.solarPanels or in user.inventory)
//        //    If you store panels in user.solarPanels, use that. Otherwise, if you store them in "inventory", check there.
//        const panelOwned = user.solarPanels.some((panelId) => panelId.toString() === solarPanelId);
//        if (!panelOwned) {
//            return res.status(400).json({ error: 'User does not own this solar panel.' });
//        }

//        // 4) Check if this tray already has a solar panel assigned and not expired
//        if (tray.solarPanel && !tray.solarPanelExpired) {
//            return res.status(400).json({ error: 'This tray already has an active solar panel assigned.' });
//        }

//        // 5) Assign the solar panel to the tray
//        tray.solarPanel = solarPanelId;
//        tray.solarPanelExpired = false; // reset in case it was previously expired

//        // 6) Save the user
//        await user.save();

//        res.json({ success: true, message: `Solar panel assigned to tray ${trayNumber}.`, tray });
//    } catch (error) {
//        console.error('Error assigning solar panel:', error);
//        res.status(500).json({ error: 'Failed to assign solar panel to tray.' });
//    }
//});


// Assign either Solar Panel or Windmill to a Tray
router.post('/:userId/trays/:trayNumber/assign-item', async (req, res) => {
    const { userId, trayNumber } = req.params;
    const { itemId, itemType } = req.body;

    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: 'User not found.' });

        // Fetch the tray
        const tray = user.trays.find(t => t.number === parseInt(trayNumber));
        if (!tray) return res.status(404).json({ error: 'Tray not found.' });

        // Check if tray already has an item assigned (solar panel or windmill)
        if (tray.solarPanel || tray.windmill) {
            return res.status(400).json({ error: 'This tray already has an item assigned.' });
        }

        // Add the item to the tray based on itemType
        if (itemType === 'solarPanel') {
            tray.solarPanel = itemId;  // Assign Solar Panel
        } else if (itemType === 'windmill') {
            tray.windmill = itemId;  // Assign Windmill
        } else {
            return res.status(400).json({ error: 'Invalid item type. Use "solarPanel" or "windmill".' });
        }

        // Save the updated user
        await user.save();

        res.json({ success: true, message: `Item assigned to tray ${trayNumber}.`, tray });
    } catch (error) {
        console.error('Error assigning item to tray:', error);
        res.status(500).json({ error: 'Failed to assign item to tray.' });
    }
});


// Clear a single pod’s tray assignment
router.post('/:userId/pods/:podId/clear', async (req, res) => {
    const { userId, podId } = req.params;

    try {
        // 1. Fetch the user document
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        // 2. Locate the specific pod by its ID
        const pod = user.seedPods.id(podId);
        if (!pod) {
            return res.status(404).json({ error: 'Seed pod not found.' });
        }

        // 3. Clear only this pod’s tray and position
        pod.tray = null;
        pod.position = null;

        // Optional: If you’d also like to revert the pod to an 'unplanted' state:
        // pod.status = 'unplanted';
        // pod.planted = false;

        // 4. Save the updated user document
        await user.save();

        // 5. Respond with a success message
        res.json({
            success: true,
            message: `Pod ${podId} has been cleared from its tray.`,
            clearedPod: pod
        });
    } catch (error) {
        console.error('Error clearing pod from tray:', error);
        res.status(500).json({ error: 'Failed to clear this pod’s tray assignment.' });
    }
});





module.exports = router;
