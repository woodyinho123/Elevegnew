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

// Purchase items with quantity
router.post('/purchase', async (req, res) => {
    const { userId, itemId, quantity } = req.body;

    // Validate quantity
    const qty = parseInt(quantity, 10) || 1;
    if (qty < 1) {
        return res.status(400).json({ error: 'Quantity must be at least 1.' });
    }

    try {
        if (!mongoose.Types.ObjectId.isValid(itemId)) {
            return res.status(400).json({ error: 'Invalid itemId format.' });
        }

        const user = await User.findById(userId);
        const item = await Item.findById(itemId);

        if (!user) return res.status(404).json({ error: 'User not found.' });
        if (!item) return res.status(404).json({ error: 'Item not found.' });

        const totalCost = item.cost_tokens * qty;

        if (user.balance_tokens < totalCost) {
            return res.status(400).json({ error: 'Insufficient tokens.' });
        }

        // Handle Tray Purchase
        if (item.category === 'tray') { // Ensure category is 'tray'
            if (user.trays.length + qty > 4) {
                return res.status(400).json({ error: 'You cannot purchase more than 4 trays.' });
            }

            for (let i = 0; i < qty; i++) {
                // Assign the next tray number
                const trayNumber = user.trays.length + 1;
                user.trays.push({ number: trayNumber, purchasedAt: new Date() });
            }
        }

        // Handle Seed and Seed Box Purchases
        if (item.category === 'seed' || item.category === 'seedBox') {
            let seedsToAdd = 0;
            if (item.category === 'seed') {
                seedsToAdd = qty;
            } else if (item.category === 'seedBox') {
                seedsToAdd = qty * 14; // 14 seeds per box
            }

            for (let i = 0; i < seedsToAdd; i++) {
                user.seedPods.push({
                    // Initialize seed pod with default values
                    // You can customize initial values if needed
                });
            }
        }

        // Deduct tokens and update inventory (for non-seed items)
        if (item.category !== 'seed' && item.category !== 'seedBox') {
            user.balance_tokens -= totalCost;
            for (let i = 0; i < qty; i++) {
                user.inventory.push(item._id);
            }
        } else {
            // Deduct tokens for seeds
            user.balance_tokens -= totalCost;
        }

        await user.save();

        // Record Transaction
        const transaction = new Transaction({
            userId,
            itemId: item._id,
            timestamp: new Date(),
            amount_tokens: totalCost,
            quantity: qty // Optional: Track quantity in transactions
        });
        await transaction.save();

        res.json({
            status: 'success',
            message: `${qty} ${item.name}${qty > 1 ? 's' : ''} purchased successfully!`,
            new_balance: user.balance_tokens,
        });
    } catch (error) {
        console.error('Error during purchase:', error);
        res.status(500).json({ error: 'Failed to complete purchase.' });
    }
});








module.exports = router;
