const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
    code: {
        type: String,
        required: true,
        unique: true
    },
    username: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true,
        default: 'user' // user, admin
    }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);