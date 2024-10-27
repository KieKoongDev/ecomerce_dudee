const mongoose = require('mongoose');
const { Schema } = mongoose;

const orderLogSchema = new Schema({
    order_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true
    },
    order_code: {
        type: String,
        required: true
    },
    by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
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

module.exports = mongoose.model('OrderLog', orderLogSchema);