const {User} = require('../models/models');

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

// exports.addAddress = async (req, res, )