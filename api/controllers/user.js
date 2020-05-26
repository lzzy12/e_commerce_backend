const {User, Address} = require('../models/models');

exports.addOrder = async (req, res, next) => {
    try {
        await User.findOneAndUpdate(
            {_id: req.body.profile.id},
            {$push: {orders: req.body.order}},
        ).exec();
        res.status(200).json(req.body.order);
    } catch(e){
        res.status(400).json(e);
    }
}

exports.addAddress = async (req, res, next) => {
    try {
        await User.findOneAndUpdate(
            {_id: req.body.profile.id},
            {$push: {addresses: req.body.address}}
        );
        res.status(200).json();
    } catch(e){
        res.status(400).json(e);
    }
}

exports.editAddress = async  (req, res, next) => {
    try {
        await Address.findOneAndUpdate({_id: req.body._id, user: req.body.profile.id});
        res.status(200).json();
    } catch(e){
        res.status(400).json(e);
    }
}