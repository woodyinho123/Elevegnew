//token store


const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Item = require('../models/Item');
const Transaction = require('../models/Transaction');
const mongoose = require('mongoose');
const Fertilizer = require('../models/Fertilizer');  // Add this line to import the Fertilizer model


// Fetch all store items
router.get('/items', async (req, res) => {
    try {
        const items = await Item.find({});
        res.json(items);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch store items.' });
    }
});

// Fetch user token balance
router.get('/balance/:userId', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) return res.status(404).json({ error: 'User not found.' });
        res.json({ balance_tokens: user.balance_tokens });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch balance.' });
    }
});


router.post('/purchase', async (req, res) => {
    const { userId, itemId, quantity } = req.body;

    try {
        // Validate itemId format
        if (!mongoose.Types.ObjectId.isValid(itemId)) {
            return res.status(400).json({ error: 'Invalid itemId format.' });
        }

        // Find the user and item
        const user = await User.findById(userId);
        const item = await Item.findById(itemId);

        // Ensure both user and item exist
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }
        if (!item) {
            return res.status(404).json({ error: 'Item not found.' });
        }

        // Parse quantity
        const qty = parseInt(quantity, 10) || 1;
        if (qty < 1) {
            return res.status(400).json({ error: 'Quantity must be at least 1.' });
        }

        // Calculate cost and check user tokens
        const totalCost = item.cost_tokens * qty;
        if (user.balance_tokens < totalCost) {
            return res.status(400).json({ error: 'Insufficient tokens.' });
        }

        // ================== HANDLE SEEDS ==================
if (item.category === 'seed' || item.category === 'seedBox') {
    const currentPodCount = user.seedPods.length;
    const podsToAdd = item.category === 'seedBox' ? 14 * qty : qty;

    console.log(`User currently has ${currentPodCount} pods.`);
    console.log(`Item category: ${item.category}`);
    console.log(`Quantity purchased: ${qty}`);
    console.log(`Total pods to add: ${podsToAdd}`);

    if (currentPodCount + podsToAdd > 56) {
        return res.status(400).json({
            error: `You currently have ${currentPodCount} pods. Buying ${podsToAdd} more would exceed the 56-pod limit.`,
        });
    }

    // ?? FIX: Declare `newPods` before using it
    let newPods = [];

    // ?? Create new seed pods and store them in `newPods`
    for (let i = 0; i < podsToAdd; i++) {
        newPods.push({
            status: 'unplanted',
            planted: false,
            tray: null,
            position: null,
            fertilizerApplied: false,
            growthDays: 0,
            growthToday: 0,
            dailyWaterUsage: 0,
            dailyFertilizerUsage: 0,
            lastUsageDate: null,
            lastGrowthDate: null,
        });

        console.log(`Prepared pod #${i + 1}`);
    }

    // ?? Append newPods to the existing seedPods array using `set()`
    user.set('seedPods', [...user.seedPods, ...newPods]);

    console.log(`Total seed pods after loop: ${user.seedPods.length}`);

    // ?? Save the user document
    await user.save();
    console.log("User successfully saved to database.");
}

        // =================== HANDLE FERTILIZER ===================
        if (item.category === 'Supplies' && item.name === 'Fertilizer Pack') {
            // Create and save a new fertilizer document
            const newFertilizer = new Fertilizer({
                userId: user._id,
                usesRemaining: 14,  // Now starts with 14 uses
                harvestedPodsCount: 0,
            });
            await newFertilizer.save();  // Save the new fertilizer document

            // Add the fertilizer to the user's inventory (push fertilizer ID)
            user.fertilizers.push(newFertilizer._id);  // Push fertilizer ID to the array
            console.log(user.fertilizers);  // Log the fertilizers array
            // Save the user with the updated inventory
            await user.save();
        }

         // ================== HANDLE TRAY PURCHASE ==================
        if (item.category === 'tray') {
            for (let i = 0; i < qty; i++) {
                const newTrayNumber = user.trays.length + 1; // Assign next tray number

                user.trays.push({
                    number: newTrayNumber,
                    purchasedAt: new Date(),
                    solarPanel: null,
                    windmill: null,
                    solarPanelExpired: false,
                    windmillExpired: false,
                    totalHarvests: 0
                });

                console.log(`Tray purchased! Assigned tray number: ${newTrayNumber}`);
            }

            console.log(`Total trays after purchase: ${user.trays.length}`);

            // Force Mongoose to track modifications
            user.markModified('trays');
        }



        // ================== HANDLE SOLAR PANELS ==================
        if (item.category === 'equipment' && item.name === 'Solar Panel') {
            // Add solar panel to the user's inventory
            user.solarPanels.push(item._id);
        }

        // ================== HANDLE WINDMILLS ==================
        if (item.category === 'equipment' && item.name === 'Windmill') {
            // Add windmill to the user's inventory
            user.windmills.push(item._id);
        }

        // Deduct the total cost from user’s tokens
        user.balance_tokens -= totalCost;

        // Save the user with updated items and token balance
        await user.save();

        // Create a transaction record
        const transaction = new Transaction({
            userId,
            itemId: item._id,
            timestamp: new Date(),
            amount_tokens: totalCost,
            quantity: qty,
        });
        await transaction.save();

        // Respond
        res.json({
            status: 'success',
            message: `${qty} ${item.name}(s) purchased successfully!`,
            new_balance: user.balance_tokens,
        });
    } catch (error) {
        console.error('Error during purchase:', error);
        res.status(500).json({ error: 'Failed to complete purchase.' });
    }
});

// GET /api/token-store/fertilizers/:userId         get fertilizers uses remaining
router.get('/fertilizers/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        // Find all fertilizer documents for this user
        const fertilizers = await Fertilizer.find({ userId });

        if (!fertilizers || fertilizers.length === 0) {
            return res.status(404).json({ error: 'No fertilizers found for this user.' });
        }

        // Respond with an array of fertilizer info
        res.json({ fertilizers });
    } catch (error) {
        console.error('Error fetching fertilizer info:', error);
        res.status(500).json({ error: 'Failed to fetch fertilizer info.' });
    }
});



   

module.exports = router;
