const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the fertilizer schema
const fertilizerSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',  // Reference to the User model
        required: true
    },
    expired: {
        type: Boolean,
        default: false
    },
    usesRemaining: {
        type: Number,
        default: 1 // Default to 1 use, can be modified as per your requirements
    },
    harvestedPodsCount: {
        type: Number,
        default: 0 // Track the number of pods harvested with this fertilizer
    },
    purchasedAt: {
        type: Date,
        default: Date.now // Track when the fertilizer was purchased
    }
});

// Create and export the Fertilizer model
const Fertilizer = mongoose.model('Fertilizer', fertilizerSchema);
module.exports = Fertilizer;
