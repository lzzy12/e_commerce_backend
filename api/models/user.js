const mongoose = require('mongoose');
const {Schema} = mongoose;
const {addressSchema} = require('./address');
const {OrderSchema} = require('./order');

const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const phoneRegex = /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s./0-9]*$/g

const userSchema = new Schema({
    email: {
        type: String,
        match: emailRegex,
        required: true,
        unique: true,
    },
    first_name: {
        type: String,
        required: true,
    },
    last_name: {
        type: String,
        required: true,
    },
    profile_pic: String,
    
    password: {
        type: String,
        minlength: 6,
    },
    phone_num: {
        type: String,
        maxlength: 15,
        match: phoneRegex,
        minlength: 5
    },
    role: {
      type: Number,
      enum: [0, 1]    // { 0: Normal user, 1: Admin }
    },
    addresses: [addressSchema],
    orders: [OrderSchema]
});

module.exports = mongoose.model('User', userSchema);