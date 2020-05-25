const { User } = require('../models/models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

function getToken(user) {
    return jwt.sign({
        email: user.email,
        id: user._id,
    }, process.env.JWT_SECRET_KEY, {
        expiresIn: "6h"
    });
}

exports.isAuthenticated = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        req.body.profile = jwt.verify(token, process.env.JWT_SECRET_KEY);
        next();
    } catch(e){
        res.status(403).json({error: {message: "Not Authenticated"}});
    }
}

exports.isAdmin = async (req, res, next) => {
    try {
        const user = await User.findOne({_id: req.body.profile.id}).select('role').exec();
        req.body.profile.admin = (user.role === 1)
        console.log(req.body.profile.admin);
        next();
    } catch(error) {
        res.status(400).json(error);
    }
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
                const user = User({
                    email: body.email,
                    first_name: body.first_name,
                    last_name: body.last_name,
                    password: body.password,
                    phone_num: body.phone_num,
                    role: 0,
                    addresses: body.addresses,
                });
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
