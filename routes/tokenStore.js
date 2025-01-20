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
    const { userId, itemId, quantity } = req.body;

    try {
        // Validate the itemId format
        if (!mongoose.Types.ObjectId.isValid(itemId)) {
            return res.status(400).json({ error: 'Invalid itemId format.' });
        }

        // Fetch the user and item from the database
        const user = await User.findById(userId);
        const item = await Item.findById(itemId);

        // Ensure user and item exist
        if (!user) return res.status(404).json({ error: 'User not found.' });
        if (!item) return res.status(404).json({ error: 'Item not found.' });

        // Ensure quantity is a valid number
        const qty = parseInt(quantity, 10) || 1;
        if (qty < 1) {
            return res.status(400).json({ error: 'Quantity must be at least 1.' });
        }

        // Calculate the total cost of the purchase (item cost * quantity)
        const totalCost = item.cost_tokens * qty;

        // Check if the user has enough tokens to complete the purchase
        if (user.balance_tokens < totalCost) {
            return res.status(400).json({ error: 'Insufficient tokens.' });
        }

        // Handle purchasing fertilizer (example)
        if (item.category === 'supplies' && item.name === 'Fertilizer Pack') {
            // Create and save the new fertilizer
            const newFertilizer = new Fertilizer({
                userId: user._id,
                usesRemaining: 1, // Starting with 1 use
                harvestedPodsCount: 0 // Starting with 0 pods harvested
            });

            await newFertilizer.save(); // Save the new fertilizer

            // Add fertilizer to the user's inventory (if needed)
            user.inventory.push(newFertilizer._id);
        }

        // Handle purchasing tray
        if (item.category === 'tray') {
            // Check if the user already has 4 trays (limit is 4 trays per user)
            if (user.trays.length + qty > 4) {
                return res.status(400).json({ error: 'You cannot purchase more than 4 trays.' });
            }

            // Add the specified number of trays to the user's trays array
            for (let i = 0; i < qty; i++) {
                // Assign the next tray number
                const trayNumber = user.trays.length + 1;
                user.trays.push({ number: trayNumber, purchasedAt: new Date() });
            }
        }

        // Deduct the total cost from the user's balance
        user.balance_tokens -= totalCost;

        // Save the user with updated balance
        await user.save();

        // Record the transaction (optional)
        const transaction = new Transaction({
            userId,
            itemId: item._id,
            timestamp: new Date(),
            amount_tokens: totalCost,
            quantity: qty
        });

        await transaction.save();

        // Respond to the client with a success message
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
