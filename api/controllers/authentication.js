const { User } = require('../models/models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

const google_client = new OAuth2Client(process.env.OAUTH_CLIENT_ID_BACKEND);


function getToken(user) {
    return jwt.sign({
        email: user.email,
        id: user._id,
    }, process.env.JWT_SECRET_KEY, {
        expiresIn: (6 * 60 * 60)
    });
}


exports.isAuthenticated = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        req.body.profile = jwt.verify(token, process.env.JWT_SECRET_KEY);
        next();
    } catch (e) {
        res.status(403).json({ error: { message: "Not Authenticated" } });
    }
}
// Checks if user is an admin; always calls next(); req.body.profile.admin
// contains a boolean value indicating if user is an admin
exports.checkAdmin = (req, res, next) => {
    try {
        User.findOne({ _id: req.body.profile.id }).select('role').exec((err, user) => {
            if (err) return res.status(400).json(err);
            req.body.profile.admin = (user.role === 1);
            next();
        });
    } catch (error) {
        res.status(400).json(error);
    }
}

// Checks if user is an admin user; If not breaks the
// request flow with 403 status code in response; calls next if user is admin
exports.isAdmin = (req, res, next) => {
    try {
        User.findOne({ _id: req.body.profile.id }).select('role').exec((err, user) => {
            if (err) return res.status(400).json(err);
            if (user) {
                if (user.role === 1) {
                    req.body.profile.admin = true;
                    console.log(req.body.profile.id);
                    next();
                } else res.status(403).json({ error: { message: "Permission denied" } });
            }
        });
    } catch (error) {
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
            if (!req.body.password || req.body.password.length < 6) {
                return res.status(400).json({ error: { message: 'Password validation failed!' } });
            }
            bcrypt.hash(req.body.password, 15, (err, hash) => {
                if (err) {
                    return res.status(500).json(err);
                }
                const body = req.body;
                body.password = hash;
                try {
                    const user = new User({
                        email: body.email,
                        first_name: body.first_name,
                        last_name: body.last_name,
                        password: body.password,
                        phone_num: body.phone_num,
                        role: 0,
                        addresses: body.addresses,
                    });
                    user.save(err => {
                        if (err) return res.status(400).json(err);
                        const { email, first_name, last_name, phone_num, addresses } = user;
                        res.status(201).json({
                            token: getToken(user),
                            expiresIn: (6 * 60 * 60),
                            email, first_name, last_name, phone_num, addresses,
                            user_id: user._id,
                        });
                    });
                } catch (e) {
                    res.status(400).json(e);
                }
            });

        }
    }).catch(err => {
        res.status(500).json(err);
    });
}

exports.login = (req, res, next) => {
    User.findOne({ email: req.body.email }).exec().then(user => {
        if (user) {
            if (!req.body.password) {
                return res.status(400).json({ error: { message: 'Invalid credentials' } });
            }
            bcrypt.compare(req.body.password, user.password, (err, result) => {
                if (result) {
                    const { email, first_name, last_name, phone_num, addresses } = user;
                    res.status(201).json({
                        token: getToken(user),
                        expiresIn: (6 * 60 * 60),
                        email, first_name, last_name, phone_num, addresses,
                        user_id: user._id,
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

exports.googleAuth = async (req, res, next) => {
    try {
        const ticket = await google_client.verifyIdToken({
            idToken: req.body.token,
            audience: process.env.OAUTH_CLIENT_ID_FRONTEND,
        });
        const payload = ticket.getPayload();
        const user = await User.findOne({ email: payload.email}).exec();
        if (user) {
            // LOGIN USER
            const { email, first_name, last_name, phone_num, addresses } = user;
            res.status(201).json({
                token: getToken(user),
                expiresIn: (6 * 60 * 60),
                email, first_name, last_name, phone_num, addresses,
                user_id: user._id,
                profile_pic: payload.picture
            });
        } else {
            // Creates new user
            let msg = '';
            if (!payload.email)
                msg = 'Email not found in the token';
            if (!payload.given_name)
                msg = 'First name not found in the token';
            if (!payload.family_name)
                msg = 'Last name not found in the token';
            if (msg.length > 0)
                return res.status(400).json({ error: { message: msg } });
            const user = User({
                email: payload.email,
                first_name: payload.given_name,
                last_name: payload.family_name,
                profile_pic: payload.picture,
            });
            const result = await user.save();
            if (result) {
                const { email, first_name, last_name, phone_num, addresses } = user;
                res.status(201).json({
                    token: getToken(user),
                    expiresIn: (6 * 60 * 60),
                    email, first_name, last_name, phone_num, addresses,
                    user_id: user._id,
                    profile_pic: payload.picture
                });
            } else{
                res.status(500).json({ error: { message: 'Something went wrong. Unable to sign in!' } });
            }
        }
    } catch (e) {
        console.log(e);
        res.status(403).json({ error: { message: 'Something went wrong. Unable to sign in!' } });
    }
}