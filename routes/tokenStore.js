//token store


const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Item = require('../models/Item');
const Transaction = require('../models/Transaction');
const mongoose = require('mongoose');


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
// POST /api/token-store/purchase
// Purchase an item with tokens (fertilizer, tray, seeds, etc.)
router.post('/purchase', async (req, res) => {
    const { userId, itemId, quantity } = req.body;

    try {
        // 1) Validate the itemId format
        if (!mongoose.Types.ObjectId.isValid(itemId)) {
            return res.status(400).json({ error: 'Invalid itemId format.' });
        }

        // 2) Find the user and the item
        const user = await User.findById(userId);
        const item = await Item.findById(itemId);

        // 3) Ensure both user and item exist
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }
        if (!item) {
            return res.status(404).json({ error: 'Item not found.' });
        }

        // 4) Parse quantity
        const qty = parseInt(quantity, 10) || 1;
        if (qty < 1) {
            return res.status(400).json({ error: 'Quantity must be at least 1.' });
        }

        // 5) Calculate cost and check user tokens
        const totalCost = item.cost_tokens * qty;
        if (user.balance_tokens < totalCost) {
            return res.status(400).json({ error: 'Insufficient tokens.' });
        }

        // ==================
        //  HANDLE SEEDS
        // ==================
        // If you want to create pods automatically whenever an item with category "seed" or "seedBox" is bought:
        if (item.category === 'seed' || item.category === 'seedBox') {
            // A) Check the current number of seed pods
            const currentPodCount = user.seedPods.length;

            // B) If adding 'qty' seeds would exceed 56 total, block the purchase
            if (currentPodCount + qty > 56) {
                return res.status(400).json({
                    error: `You currently have ${currentPodCount} pods. Buying ${qty} more would exceed the 56-pod limit.`,
                });
            }

            // C) For each seed purchased, push a new seed pod to user.seedPods
            for (let i = 0; i < qty; i++) {
                user.seedPods.push({
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
            }
        }

        // ===============================
        //  HANDLE FERTILIZER (SUPPLIES)
        // ===============================
        if (item.category === 'supplies' && item.name === 'Fertilizer Pack') {
            // Create and save a new fertilizer document
            const newFertilizer = new Fertilizer({
                userId: user._id,
                usesRemaining: 1, // Start with 1
                harvestedPodsCount: 0,
            });
            await newFertilizer.save();

            // Optionally add the fertilizer doc _id to the user's inventory
            user.inventory.push(newFertilizer._id);
        }

        // ==============
        //  HANDLE TRAYS
        // ==============
        if (item.category === 'tray') {
            // Check if this purchase would exceed 4 trays
            if (user.trays.length + qty > 4) {
                return res
                    .status(400)
                    .json({ error: 'You cannot purchase more than 4 trays total.' });
            }

            // Add the new trays
            for (let i = 0; i < qty; i++) {
                const trayNumber = user.trays.length + 1;
                user.trays.push({ number: trayNumber, purchasedAt: new Date() });
            }
        }

        // 6) Deduct the total cost from user’s tokens
        user.balance_tokens -= totalCost;

        // 7) Save the user with updated pods/trays/inventory and token balance
        await user.save();

        // 8) Create a transaction record
        const transaction = new Transaction({
            userId,
            itemId: item._id,
            timestamp: new Date(),
            amount_tokens: totalCost,
            quantity: qty,
            // Optionally add "type", e.g. "seed_purchase" or "tray_purchase"
        });
        await transaction.save();

        // 9) Respond
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











module.exports = router;
