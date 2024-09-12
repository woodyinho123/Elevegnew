// models/MealPlan.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const mealPlanSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId, // Reference to the User model
        ref: 'User',
        required: true
    },
    week: {
        type: Number, // Week 1, Week 2, etc.
        required: true
    },
    crops: [{
        cropType: {
            type: String, // Type of crop, e.g., Beet, Basil, etc.
            required: true
        },
        quantity: {
            type: Number,
            required: true
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, { collection: 'MealPlans' });

const MealPlan = mongoose.model('MealPlan', mealPlanSchema);

module.exports = MealPlan;
