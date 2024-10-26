const mongoose = require('mongoose');
const { Schema } = mongoose;

const userAddressSchema = new Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    address: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    receiver_name: {
        type: String,
        required: false,
        default: ''
    }
}, { timestamps: true });

module.exports = mongoose.model('UserAddress', userAddressSchema);