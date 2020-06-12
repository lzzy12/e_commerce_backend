const {User, Address} = require('../models/models');

exports.addOrder = async (req, res, next) => {
    try {
        await User.findOneAndUpdate(
            {_id: req.body.profile.id},
            {$push: {orders: req.result.order}},
        ).exec();
        res.status(200).json(req.result);
    } catch(e){
        console.log(e);
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

exports.getAllUsers = async (req, res, next) => {
    try{
        res.result.results  = await User.find().limit(res.limits.pageSize).skip(res.limits.startIndex).select('-__v').exec();
        res.status(200).json(res.result);
    } catch(e){
        res.status(500).json(e);
    }
}

exports.getUser = async (req, res, next) => {
    try {
        const user = await User.findOne({ email: req.body.profile.email }).exec();
        const { email, first_name, last_name, phone_num, addresses } = user;
        res.status(200).json({
            email, first_name, last_name, phone_num, addresses
        });
    } catch (e) {
        res.status(400).json(e);
    }
}
