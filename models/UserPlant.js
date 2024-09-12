// models/UserPlant.js -  schema to track which plants the user has planted, including the planted date and the expected harvest date.
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userPlantSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    plantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Plant',
        required: true
    },
    plantedDate: {
        type: Date,
        required: true
    },
    expectedHarvestDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['growing', 'harvested'],
        default: 'growing'
    }
}, { collection: 'UserPlants' });

const UserPlant = mongoose.model('UserPlant', userPlantSchema);

module.exports = UserPlant;
