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
        console.log(await Item.find());
        // Log the raw itemId received for debugging
        console.log(`itemId from request: "${itemId}"`);
        // Validate itemId format
        if (!mongoose.Types.ObjectId.isValid(itemId)) {
            console.error(`Invalid itemId format detected: "${itemId}"`);
            return res.status(400).json({ error: 'Invalid itemId format.' });
        }

        console.log('itemId:', itemId);
        console.log('isValid ObjectId:', mongoose.Types.ObjectId.isValid(itemId));

        // Convert itemId to ObjectId directly
        let objectId;
        try {
            objectId = new mongoose.Types.ObjectId(itemId);
        } catch (err) {
            console.log('Error converting itemId to ObjectId:', err);
            return res.status(400).json({ error: 'Invalid itemId format.' });
        }
        console.log('Converted ObjectId:', objectId);

        // Fetch user and item
        const user = await User.findById(userId);
        const item = await Item.findById(objectId);

        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }
        if (!item) {
            return res.status(404).json({ error: 'Item not found.' });
        }

        // Check if the user has enough tokens
        if (user.balance_tokens < item.cost_tokens) {
            return res.status(400).json({ error: 'Insufficient tokens.' });
        }

        // Deduct tokens and add the item to the user's inventory
        user.balance_tokens -= item.cost_tokens;
        user.inventory.push(item);
        await user.save();

        // Log the transaction
        const transaction = new Transaction({
            userId,
            itemId: objectId,
            timestamp: new Date(),
            amount_tokens: item.cost_tokens,
        });
        await transaction.save();

        res.json({ status: 'success', message: 'Purchase successful!', new_balance: user.balance_tokens });
    } catch (error) {
        console.error('Error during purchase:', error);
        res.status(500).json({ error: 'Failed to complete purchase.' });
    }
});
module.exports = router;
