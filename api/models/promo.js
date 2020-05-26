const mongoose = require('mongoose');
const {Schema} = mongoose;

const promoSchema = new Schema({
    code: {
        required: true,
        type: String,
    },
    discount_percent: {
        required: true,
        type: Number,
        min: 0,
        max: 100
    },
    description: {
        required: true,
        type: String,
    },
    discount_upto: {
        type: Number,
    },
    expiryDate: {
        type: Date,
        required: true,
    },
    pic: {
        required: true,
        type: String
    }
});

module.exports = {promoSchema, Promo: mongoose.model('Promo', promoSchema)};