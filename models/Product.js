const mongoose = require('mongoose');
const { Schema } = mongoose;

const productSchema = new Schema({
    code: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: false,
        default: ''
    },
    price: {
        type: Number,
        required: true
    },
    stock: {
        type: Number,
        required: true,
        default: 0
    },
    category: {
        type: String,
        required: true
    },
    unit: {
        type: String,
        required: false,
        default: 'unit'
    },
    status: {
        type: Number,
        required: true,
        default: 1
        /*
            1: active
            0: inactive
        */
    }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);