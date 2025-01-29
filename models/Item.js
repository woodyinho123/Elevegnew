//item model

const mongoose = require('mongoose');
const itemSchema = new mongoose.Schema({
    name: String,
   
    cost_tokens: Number,
    description: String,
    category: {
        type: String,
        enum: ['seed', 'seedBox', 'tray', 'other', 'seedBox', 'equipment', 'Supplies'],
        required: true
    },
});

module.exports = mongoose.model('Item', itemSchema, 'Item'); // Ensure 'Item' matches the actual collection name
