const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Reward = require('../models/Reward');

// Get user rewards and coin balance
router.get('/', auth, async (req, res) => {
    try {
        console.log("User ID from JWT:", req.user.id);
        const rewards = await Reward.findOne({ userId: req.user.id });
        if (!rewards) {
            return res.status(404).json({ msg: 'No rewards found' });
        }
        res.json(rewards);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Update coin balance after completing a task
router.post('/complete-task', auth, async (req, res) => {
    const { taskId, coins } = req.body;

    try {
        let reward = await Reward.findOne({ userId: req.user.id });

        if (!reward) {
            // If no reward record exists, create a new one
            reward = new Reward({
                userId: req.user.id,
                coinBalance: coins,
                availableRewards: [] // you can prepopulate available rewards here
            });
        } else {
            reward.coinBalance += coins;
        }

        await reward.save();

        res.json({ msg: 'Task completed and coins updated', reward });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

router.post('/', auth, async (req, res) => {
    const { userId, coins, availableRewards } = req.body;

    try {
        // Find the existing reward document for this user and update it
        let reward = await Reward.findOneAndUpdate(
            { userId: userId },
            {
                $set: {
                    coinBalance: coins,
                    availableRewards: availableRewards
                }
            },
            { new: true, upsert: true } // upsert: true creates the document if it doesn't exist
        );

        res.status(200).json(reward);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});



// Redeem a reward
router.post('/redeem', auth, async (req, res) => {
    const { rewardId, cost } = req.body;

    try {
        const reward = await Reward.findOne({ userId: req.user.id });

        if (!reward || reward.coinBalance < cost) {
            return res.status(400).json({ msg: 'Insufficient balance' });
        }

        reward.coinBalance -= cost;

        reward.redeemedRewards.push({
            rewardId,
            redeemedOn: new Date()
        });

        await reward.save();

        res.json({ msg: 'Reward redeemed successfully', reward });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
