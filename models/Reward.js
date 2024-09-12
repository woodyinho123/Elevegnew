const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const rewardSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    coinBalance: {
        type: Number,
        required: true,
        default: 0
    },
    availableRewards: [{
        task: { type: String, required: true },
        coins: { type: Number, required: true }
    }],
    redeemedRewards: [{
        rewardId: { type: mongoose.Schema.Types.ObjectId, ref: 'Reward' },
        redeemedOn: { type: Date, default: Date.now }
    }]
}, { collection: 'Rewards' });

const Reward = mongoose.model('Reward', rewardSchema);

module.exports = Reward;
