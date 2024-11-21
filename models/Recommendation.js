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
        type: String,  // Ensure this is String to hold long text data
        required: false
       
    },
    week1Skipped: { type: Boolean, default: false }, // Add a skipped flag

    week2: {
        type: String,  // Ensure this is String to hold long text data
        required: false


    },
    week2Skipped: { type: Boolean, default: false }, // Add a skipped flag

    week3: {
        type: String,  // Ensure this is String to hold long text data
        required: false

    },
    week3Skipped: { type: Boolean, default: false }, // Add a skipped flag

    week4: {
        type: String,  // Ensure this is String to hold long text data
        required: false

    },
    week4Skipped: { type: Boolean, default: false }, // Add a skipped flag

    // Add additional weeks here
    week5: {
        type: String,  // Ensure this is String to hold long text data
        required: false

    },
    week5Skipped: { type: Boolean, default: false }, // Add a skipped flag
    week6: {
        type: String,  // Ensure this is String to hold long text data
        required: false

    },
    week6Skipped: { type: Boolean, default: false }, // Add a skipped flag
    week7: {
        type: String,  // Ensure this is String to hold long text data
        required: false

    },
    week7Skipped: { type: Boolean, default: false }, // Add a skipped flag
    week8: {
        type: String,  // Ensure this is String to hold long text data
        required: false
    },
    week8Skipped: { type: Boolean, default: false }, // Add a skipped flag

    week9: {
        type: String,  // Ensure this is String to hold long text data
        required: false

    },
    week9Skipped: { type: Boolean, default: false }, // Add a skipped flag
    week10: {
        type: String,  // Ensure this is String to hold long text data
        required: false

    },
    week10Skipped: { type: Boolean, default: false }, // Add a skipped flag
    week11: {
        type: String,  // Ensure this is String to hold long text data
        required: false
    },
    week11Skipped: { type: Boolean, default: false }, // Add a skipped flag
    week12: {
        type: String,  // Ensure this is String to hold long text data
        required: false

    },
    week12Skipped: { type: Boolean, default: false }, // Add a skipped flag


    // You can continue adding fields if more weeks are needed  (look into changing this schema into array if unknown amount of weeks)
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




