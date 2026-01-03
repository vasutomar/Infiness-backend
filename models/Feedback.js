const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
    feedback: {
        type: String,
        required: true
    }
}, {
    collection: 'feedback'
});

module.exports = mongoose.model('Feedback', feedbackSchema);
