const mongoose = require('mongoose');
const { Schema } = mongoose;

const orderSchema = new Schema({
    code: {
        type: String,
        required: true,
        unique: true
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    product_price: {
        type: Number,
        required: true
    },
    delivery_method: {
        type: String,
        required: true
    },
    delivery_price: {
        type: Number,
        required: true
    },
    tracking_number: {
        type: String,
        required: false,
        default: null
    },
    net_price: {
        type: Number,
        required: true
    },
    user_address_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserAddress',
        required: true
    },
    status: {
        type: Number,
        required: true,
        default: 1,
        enum: [1, 2, 3, 4, 5, 6, 7]
        /*  1=pending
            2=processing
            3=delivering
            4=success
            5=cancle by user
            6=cancle by-admin
            7=refund
        */
    }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);