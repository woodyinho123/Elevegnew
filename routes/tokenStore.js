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
        // Validate itemId format
        if (!mongoose.Types.ObjectId.isValid(itemId)) {
            return res.status(400).json({ error: 'Invalid itemId format.' });
        }

        // Fetch the user and item
        const user = await User.findById(userId);
        const item = await Item.findById(itemId);

        if (!user) return res.status(404).json({ error: 'User not found.' });
        if (!item) return res.status(404).json({ error: 'Item not found.' });

        // Debug logs
        console.log('User inventory before purchase:', user.inventory);
        console.log('Item to be purchased:', item);

        // Check tray limit
        if (item.name === 'Tray') {
            const userTrays = user.inventory.filter(i => i.toString() === itemId);
            console.log('Current Tray Count:', userTrays.length);

            if (userTrays.length >= 4) { // 1 initial + 3 additional trays
                console.log('Tray limit exceeded. Cannot purchase more.');
                return res.status(400).json({ error: 'You cannot purchase more than 3 additional trays.' });
            }
        }

        // Check if the user has enough tokens
        if (user.balance_tokens < item.cost_tokens) {
            return res.status(400).json({ error: 'Insufficient tokens.' });
        }

        // Deduct tokens and add the item to the user's inventory
        user.balance_tokens -= item.cost_tokens;
        user.inventory.push(item._id);

        // If the purchased seed matches the specific ObjectId, add a new seed pod
        const specificSeedId = '675848f8a6d40e00584cdb9b';
        if (itemId === specificSeedId) {
            console.log('Purchased seed matches the specific seed ID.');

            // Add a new seed pod
            const newSeedPod = {
                growthDays: 0,
                growthToday: 0,
                dailyWaterUsage: 0,
                dailyFertilizerUsage: 0,
                lastUsageDate: null,
                status: 'unplanted',
                planted: false,
            };

            user.seedPods.push(newSeedPod);
            console.log('New seed pod added:', newSeedPod);
        }

        await user.save();

        // Log the transaction
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
