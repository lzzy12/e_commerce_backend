const { User } = require('../models/models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

function getToken(user) {
    return jwt.sign({
        email: user.email,
        id: user._id
    }, process.env.JWT_SECRET_KEY, {
        expiresIn: "6h"
    });
}

exports.registerUser = (req, res, next) => {
    User.find({ email: req.body.email }).then(result => {
        if (result.length > 0) {
            return res.status(400).json({
                error: 'EmailExist',
                message: 'Email id already exists!'
            });
        } else {
            bcrypt.hash(req.body.password, 15, (err, hash) => {
                if (err) {
                    return res.status(500).json(err);
                }
                const body = req.body;
                body.password = hash;
                const user = User(body);
                user.save().then(result => {
                    const {email, first_name, last_name, phone_num, addresses} = user;
                    res.status(201).json({
                        token: getToken(result),
                        email, first_name, last_name, phone_num, addresses
                    });
                });
            })

        }
    }).catch(err => {
        res.status(500).json(err);
    });
}

exports.login = (req, res, next) => {
    User.findOne({ email: req.body.email }).exec().then(user => {
        if (user) {
            bcrypt.compare(req.body.password, user.password, (err, result) => {
                if (result) {
                    const {email, first_name, last_name, phone_num, addresses} = user;
                    res.status(201).json({
                        token: getToken(user),
                        email, first_name, last_name, phone_num, addresses
                    });
                } else {
                    res.status(403).json({
                        error: {
                            message: "Invalid credentials",
                            _message: "InvalidCredentials"
                        }
                    });
                }
            });
        } else {
            res.status(403).json({
                error: {
                    message: "Invalid credentials",
                    _message: "InvalidCredentials"
                }
            });
        }
    })
}
