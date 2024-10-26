const mongoose = require('mongoose');
const { Schema } = mongoose;

const deliveryMethodSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('DeliveryMethod', deliveryMethodSchema);