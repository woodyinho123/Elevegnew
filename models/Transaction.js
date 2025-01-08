//transaction



const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item' },
    timestamp: { type: Date, default: Date.now },
    amount_tokens: { type: Number, required: true }
});

module.exports = mongoose.model('Transaction', TransactionSchema);
