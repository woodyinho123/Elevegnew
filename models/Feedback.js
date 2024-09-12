const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const feedbackSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    responses: {
        type: Object,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
}, { collection: 'feedback' });

const Feedback = mongoose.model('Feedback', feedbackSchema);

module.exports = Feedback;
