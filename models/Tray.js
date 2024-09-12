// models/Tray.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const podSchema = new Schema({
    podId: {
        type: String, // Unique ID for the pod
        required: true
    },
    cropType: {
        type: String, // Type of crop assigned to this pod......
        required: true
    },
    plantingDate: {
        type: Date, // Date when the crop was planted
        required: true
    },
    harvestDate: {
        type: Date, // Expected harvest date
        required: true
    }
});

const traySchema = new Schema({

    userId: {
        type: mongoose.Schema.Types.ObjectId, // Reference to the User model
        ref: 'User',
        required: true
    },
    trayId: {
        type: String, // Unique ID for the tray
        required: true
    },
    podData: [podSchema], // Array of pod data
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, { collection: 'TraysAndPods' });

const Tray = mongoose.model('TraysAndPods', traySchema);

module.exports = Tray;
