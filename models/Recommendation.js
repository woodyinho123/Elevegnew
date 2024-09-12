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
        required: true
    },

    week2: {
        type: String,
        required: true
    },
    week3: {
        type: String,
        required: true
    },
    week4: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
}, { collection: 'recommendations' });

const Recommendation = mongoose.model('Recommendation', recommendationSchema);

module.exports = Recommendation;
