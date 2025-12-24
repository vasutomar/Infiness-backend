const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: false,
        trim: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    streak: {
        type: Number,
        required: false
    },
    lastLogin: {
        type: Date,
        required: false
    }
}, {
    collection: 'users',
    timestamps: true,
});

module.exports = mongoose.model('User', userSchema);
