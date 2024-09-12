const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const nutritionTipSchema = new Schema({
    name: { type: String, required: true, unique: true },
    nutrients: { type: String, required: true },
    benefits: { type: String, required: true },
    growingTips: { type: String, required: true },
    seedToHarvest: { type: String, required: true }
}, { timestamps: true });

const NutritionTip = mongoose.model('NutritionTip', nutritionTipSchema);

module.exports = NutritionTip;
