//recommendation model

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const cropSchema = new Schema({
    cropType: {
        type: mongoose.Schema.Types.ObjectId, // Assuming you have a Crop model
        ref: 'Crop',
        required: true
    },
    quantity: {
        type: Number,
        required: true
    }
});


const recommendationSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    week1: {
        type: String,  // Meal plan for the week
        required: false
    },
    week1Skipped: { type: Boolean, default: false }, // Whether the week is skipped
    week1Locked: { type: Boolean, default: false }, // Prevent skipping if true

    week2: {
        type: String,  // Meal plan for the week
        required: false
    },
    week2Skipped: { type: Boolean, default: false },
    week2Locked: { type: Boolean, default: false },

    week3: {
        type: String,
        required: false
    },
    week3Skipped: { type: Boolean, default: false },
    week3Locked: { type: Boolean, default: false },

    week4: {
        type: String,
        required: false
    },
    week4Skipped: { type: Boolean, default: false },
    week4Locked: { type: Boolean, default: false },

    // Additional weeks
    week5: {
        type: String,
        required: false
    },
    week5Skipped: { type: Boolean, default: false },
    week5Locked: { type: Boolean, default: false },

    week6: {
        type: String,
        required: false
    },
    week6Skipped: { type: Boolean, default: false },
    week6Locked: { type: Boolean, default: false },

    week7: {
        type: String,
        required: false
    },
    week7Skipped: { type: Boolean, default: false },
    week7Locked: { type: Boolean, default: false },

    week8: {
        type: String,
        required: false
    },
    week8Skipped: { type: Boolean, default: false },
    week8Locked: { type: Boolean, default: false },

    week9: {
        type: String,
        required: false
    },
    week9Skipped: { type: Boolean, default: false },
    week9Locked: { type: Boolean, default: false },

    week10: {
        type: String,
        required: false
    },
    week10Skipped: { type: Boolean, default: false },
    week10Locked: { type: Boolean, default: false },

    week11: {
        type: String,
        required: false
    },
    week11Skipped: { type: Boolean, default: false },
    week11Locked: { type: Boolean, default: false },

    week12: {
        type: String,
        required: false
    },
    week12Skipped: { type: Boolean, default: false },
    week12Locked: { type: Boolean, default: false },

    generateddate: {
        type: Date,
        default: Date.now
    },
    week1StartDate: {
        type: Date,
        default: Date.now
    },
    week2StartDate: {
        type: Date,
        default: Date.now
    },
    week3StartDate: {
        type: Date,
        default: Date.now
    },
    week4StartDate: {
        type: Date,
        default: Date.now
    },
    week5StartDate: {
        type: Date,
        default: Date.now
    },
    week6StartDate: {
        type: Date,
        default: Date.now
    },
    week7StartDate: {
        type: Date,
        default: Date.now
    },
    week8StartDate: {
        type: Date,
        default: Date.now
    },
    week9StartDate: {
        type: Date,
        default: Date.now
    },
    week10StartDate: {
        type: Date,
        default: Date.now
    },
    week11StartDate: {
        type: Date,
        default: Date.now
    },
    week12StartDate: {
        type: Date,
        default: Date.now
    }
}, { collection: 'recommendations' });

const Recommendation = mongoose.model('Recommendation', recommendationSchema);

module.exports = Recommendation;

