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

router.post('/purchase', async (req, res) => {
    const { userId, itemId } = req.body;

    try {
        if (!mongoose.Types.ObjectId.isValid(itemId)) {
            return res.status(400).json({ error: 'Invalid itemId format.' });
        }

        const user = await User.findById(userId);
        const item = await Item.findById(itemId);

        if (!user) return res.status(404).json({ error: 'User not found.' });
        if (!item) return res.status(404).json({ error: 'Item not found.' });

        if (user.balance_tokens < item.cost_tokens) {
            return res.status(400).json({ error: 'Insufficient tokens.' });
        }

        // Handle Tray Purchase
        const trayId = '67584902a6d40e00584cdb9d';
        if (itemId === trayId) {
            if (user.trays.length >= 4) {
                return res.status(400).json({ error: 'You cannot purchase more than 4 trays.' });
            }

            // Assign the next tray number
            const trayNumber = user.trays.length + 1;
            user.trays.push({ number: trayNumber, purchasedAt: new Date() });
        }

        // Deduct tokens and update inventory
        user.balance_tokens -= item.cost_tokens;
        user.inventory.push(item._id);

        await user.save();

        const transaction = new Transaction({
            userId,
            itemId: item._id,
            timestamp: new Date(),
            amount_tokens: item.cost_tokens,
        });
        await transaction.save();

        res.json({
            status: 'success',
            message: `${item.name} purchased successfully!`,
            new_balance: user.balance_tokens,
        });
    } catch (error) {
        console.error('Error during purchase:', error);
        res.status(500).json({ error: 'Failed to complete purchase.' });
    }
});





module.exports = router;
