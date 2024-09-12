// models/Plant.js -  schema to store static data about each plant, including growth duration, light requirements, and other relevant information.
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const plantSchema = new Schema({
    type: {
        type: String, // Microgreens, Herb, etc.
        required: true
    },
    crop: {
        type: String, // Beet, Basil, etc.
        required: true
    },
    variety: {
        type: String, // Yellow, Green, etc.
        required: true
    },
    temperatureRange: {
        min: {
            type: Number,
            required: true
        },
        max: {
            type: Number,
            required: true
        }
    },
    germinationPeriod: {
        type: Number, // in days
        required: true
    },
    growthDuration: {
        type: Number, // in days
        required: true
    },
    lightRequirements: {
        hoursPerDay: {
            type: Number,
            required: true
        },
        periodUnderLight: {
            type: Number, // in days
            required: true
        }
    },
    irrigation: {
        frequency: {
            type: String,
            required: true
        },
        duration: {
            type: Number, // in seconds
            required: true
        }
    },
    nutrientsRequired: {
        type: Boolean,
        required: true
    }
}, { collection: 'Plants' });

const Plant = mongoose.model('Plant', plantSchema);

module.exports = Plant;
