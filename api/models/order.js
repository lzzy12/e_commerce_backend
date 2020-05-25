const mongoose = require('mongoose');
const {Schema, Types} = mongoose;
const {addressSchema} = require('./address');

const CartProductSchema = new Schema({
    product: {
        type: Types.ObjectId,
        ref: 'Product',
        required: true,
    },
    amount: {
        type: Number,
        required: true,
        default: 1,
    },
    price: {
        type: Number,
        required: true,
        min: 0,
    }
});

const OrderSchema = new Schema({
    products: [CartProductSchema],
    address: {
        type: addressSchema,
        required: true
    },
    status: {
        type: String,
        enum: ['reviewing',
            'accepted',
            'dispatched',
            'outForDelivery',
            'delivered',
            'cancelled',]
    },
    user: {
        type: Types.ObjectId,
        ref: 'User'
    },
}, {timestamps: true});

module.exports = {Order: mongoose.model('Order', OrderSchema), OrderSchema, CartProductSchema};
