const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const mealPlanMetricSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId, // Reference to the User model
        ref: 'User',
        required: true
    },
    nutrientIntake: {
        calories: { type: Number, required: true },
        protein: { type: Number, required: true },
        carbs: { type: Number, required: true },
        fats: { type: Number, required: true },
    },
    caloricNeeds: {
        type: Number,
        required: true
    },
    adherence: {
        type: Number, // Adherence percentage
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, { collection: 'MealPlanMetrics' });

const MealPlanMetric = mongoose.model('MealPlanMetric', mealPlanMetricSchema);

module.exports = MealPlanMetric;
