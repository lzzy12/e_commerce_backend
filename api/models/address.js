const mongoose = require('mongoose');
const { Schema } = mongoose;

const phone_regex = /\d{3}-\d{3}-\d{4}/;
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
    address_type: {
        type: String,
        enum: ['home', 'office'],
    }
});

module.exports = mongoose.model('Address', addressSchema);
module.exports.addressSchema = addressSchema;