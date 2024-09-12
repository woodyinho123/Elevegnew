const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const journalEntrySchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to the User model
        required: true
    },
    alcohol: {
        hadAny: { type: Boolean, required: true },
        quantity: { type: Number }
    },
    caffeine: {
        hadAny: { type: Boolean, required: true },
        cups: { type: Number },
        lastServingTime: { type: String }  // E.g., "10:00 PM"
    },
    lateNightFood: {
        hadAny: { type: Boolean, required: true }
    },
    water: {
        glasses: { type: Number, required: true }
    },
    sleep: {
        hours: { type: Number, required: true }
    },
    exercise: {
        didExercise: { type: Boolean, required: true },
        type: { type: String },
        duration: { type: Number }, // Duration in minutes
        energyLevel: { type: Number } // 1-10 scale for how energized they felt
    },
    homeGrownFood: {
        ateAny: { type: Boolean, required: true },
        selectedCrops: { type: [String] } // Array of selected crops
    },
    macros: {
        knowMacros: { type: Boolean, required: true },
        details: {
            calories: { type: Number },
            protein: { type: Number },
            carbs: { type: Number },
            fats: { type: Number }
        }
    },
    mood: {
        rating: { type: Number, required: true } // 1-10 scale for mood
    },
    observations: {
        type: String // Free text field for additional observations
    },
    date: {
        type: Date,
        default: Date.now
    }
});

const JournalEntry = mongoose.model('JournalEntry', journalEntrySchema);
module.exports = JournalEntry;
