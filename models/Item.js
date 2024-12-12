const mongoose = require('mongoose');
const itemSchema = new mongoose.Schema({
    name: String,
    category: String,
    cost_tokens: Number,
    description: String,
});

module.exports = mongoose.model('Item', itemSchema, 'Item'); // Ensure 'Item' matches the actual collection name
