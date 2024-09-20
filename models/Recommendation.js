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
        type: String,
        required: false
    },

    week2: {
        type: String,
        required: false
    },
    week3: {
        type: String,
        required: false
    },
    week4: {
        type: String,
        required: false
    },

    // Add additional weeks here
    week5: {
        type: String,
         required: false
    },
    week6: {
        type: String,
         required: false
    },
    week7: {
        type: String,
         required: false
    },
    week8: {
        type: String,
         required: false
    },

    week9: {
        type: String,
         required: false
    },
    week10: {
        type: String,
         required: false
    },
    week11: {
        type: String,
         required: false
    },
    week12: {
        type: String,
         required: false
    },
    // You can continue adding fields if more weeks are needed  (look into changing this schema into array if unknown amount of weeks)
    date: {
        type: Date,
        default: Date.now
    }
}, { collection: 'recommendations' });

const Recommendation = mongoose.model('Recommendation', recommendationSchema);

module.exports = Recommendation;
