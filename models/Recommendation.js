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
        "Day 1": String,
        "Day 2": String,
        "Day 3": String,
        "Day 4": String,
        "Day 5": String,
        "Day 6": String,
        "Day 7": String
       
    },

    week2: {
        "Day 1": String,
        "Day 2": String,
        "Day 3": String,
        "Day 4": String,
        "Day 5": String,
        "Day 6": String,
        "Day 7": String


    },

    week3: {
        "Day 1": String,
        "Day 2": String,
        "Day 3": String,
        "Day 4": String,
        "Day 5": String,
        "Day 6": String,
        "Day 7": String


    },
    week4: {
        "Day 1": String,
        "Day 2": String,
        "Day 3": String,
        "Day 4": String,
        "Day 5": String,
        "Day 6": String,
        "Day 7": String


    },

    // Add additional weeks here
    week5: {
        "Day 1": String,
        "Day 2": String,
        "Day 3": String,
        "Day 4": String,
        "Day 5": String,
        "Day 6": String,
        "Day 7": String


    },
    week6: {
        "Day 1": String,
        "Day 2": String,
        "Day 3": String,
        "Day 4": String,
        "Day 5": String,
        "Day 6": String,
        "Day 7": String

    },
    week7: {
        "Day 1": String,
        "Day 2": String,
        "Day 3": String,
        "Day 4": String,
        "Day 5": String,
        "Day 6": String,
        "Day 7": String


    },
    week8: {
        "Day 1": String,
        "Day 2": String,
        "Day 3": String,
        "Day 4": String,
        "Day 5": String,
        "Day 6": String,
        "Day 7": String

    },

    week9: {
        "Day 1": String,
        "Day 2": String,
        "Day 3": String,
        "Day 4": String,
        "Day 5": String,
        "Day 6": String,
        "Day 7": String


    },
    week10: {
        "Day 1": String,
        "Day 2": String,
        "Day 3": String,
        "Day 4": String,
        "Day 5": String,
        "Day 6": String,
        "Day 7": String


    },
    week11: {
        "Day 1": String,
        "Day 2": String,
        "Day 3": String,
        "Day 4": String,
        "Day 5": String,
        "Day 6": String,
        "Day 7": String

    },
    week12: {
        "Day 1": String,
        "Day 2": String,
        "Day 3": String,
        "Day 4": String,
        "Day 5": String,
        "Day 6": String,
        "Day 7": String


    },
    // You can continue adding fields if more weeks are needed  (look into changing this schema into array if unknown amount of weeks)
    date: {
        type: Date,
        default: Date.now
    }
}, { collection: 'recommendations' });

const Recommendation = mongoose.model('Recommendation', recommendationSchema);

module.exports = Recommendation;
