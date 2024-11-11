// models/Order.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderSchema = new Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [
        {
            cropId: { type: mongoose.Schema.Types.ObjectId, ref: 'NutritionTip', required: true }, // Referencing NutritionTip
            quantity: { type: Number, required: true }
        }
    ],
    status: { type: String, default: 'draft' },
    createdDate: { type: Date, default: Date.now }
});

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
