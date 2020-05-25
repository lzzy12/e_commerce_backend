const mongoose = require('mongoose');
const { Schema } = mongoose;
const { addressSchema } = require('./address');

const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const phoneRegex = /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/g
const userSchema = new Schema({
    email: {
        type: String,
        match: emailRegex,
        required: true,
        unique: true,
    },
    firstname: {
        type: String,
        required: true,
    },
    lastname: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        minlength: 6,
        required: true,
    },
    phone_num: {
        type: String,
        maxlength: 15,
        validate: {
            validator: function (v) {
                return phoneRegex.test(v);
            },
            message: '{VALUE} is not a valid phone number!'
        },
    },
    addresses: [addressSchema]
});

module.exports = mongoose.model('User', userSchema);