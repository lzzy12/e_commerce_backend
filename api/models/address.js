const mongoose = require('mongoose');
const { Schema } = mongoose;

const phone_regex = /^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/;
const addressSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    colony: {
        type: String,
        required: true,
    },
    state: {
        type: String,
        required: true,
    },
    city: {
        type: String,
        required: true,
    },
    zip: {
        type: String,
        required: true,
    },
    landmark: String,
    phone_num: {
        type: String,
        maxlength: 15,
        required: true,
        match: phone_regex,
    },
    country:{
        type: String,
        required: true,
    },
    address_type: {
        type: String,
        enum: ['home', 'office'],
    },
    user: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
    }
});

module.exports = mongoose.model('Address', addressSchema);
module.exports.addressSchema = addressSchema;