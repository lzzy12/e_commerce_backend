const mongoose = require('mongoose');
const {Schema, Types} = mongoose;
const {addressSchema} = require('./address');

const orderStatus = {
            processing: 0,
            reviewing: 1,
            accepted: 2,
            dispatche: 3,
            outForDelivery: 4,
            delivered: 5,
            cancelled: 6,
}

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
        type: Number,
        min: orderStatus.processing,
        max: orderStatus.cancelled,
        default: orderStatus.processing
    },
    user: {
        type: Types.ObjectId,
        ref: 'User'
    },
    promo: {
        type: Types.ObjectId,
        ref: 'Promo'
    },
    trackingId: {
        type: String,
        required: false,
    },
}, {timestamps: true});

module.exports = {Order: mongoose.model('Order', OrderSchema), OrderSchema, CartProductSchema, orderStatus};
