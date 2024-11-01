const mongoose = require('mongoose');
const { Schema } = mongoose;

const userLogSchema = new Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    user_code: {
        type: String,
        required: true
    },
    action: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: false,
        default: ''
    }
}, { timestamps: true });

module.exports = mongoose.model('UserLog', userLogSchema);