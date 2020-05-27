const {Order} = require('../models/models');

exports.getOrderById = (req, res) => {
    Order.findOne({_id: req.params.order_id}).select('-__v').exec().then(order => {
        if (order) {
            res.status(200).json(order);
        } else {
            res.status(404).json({error: {message: "Order not found"}});
        }
    }).catch(e => {
        res.status(500).json(e);
    });
}

exports.getAllOrder = async (req, res) => {
    try {
        if (req.body.profile.admin === true) {
            res.result.results = await Order.find().limit(res.limits.pageSize).skip(res.limits.startIndex).select('-__v').exec();
        } else {
            res.result.results = await Order.find({user: req.body.profile.id}).select('-__v').exec();
        }
        res.status(200).json(res.result);
    } catch (error) {
        res.status(500).json(error);
    }
}

exports.getAllOrderByUser = (req, res) => {
    Order.find({user: req.body.profile.id}).select('-__v').exec().then(orders => {
        res.status(200).json(orders);
    }).catch(error => {
        res.status(500).json(error);
    });
}

exports.updateStatus = async (req, res) => {
    try {
        if (req.body.admin) {
            const updatedOrder = await Order.findOneAndUpdate({_id: req.params.order_id},
                {$set: {status: req.body.status}}, {new: true});
            if (updatedOrder)
                res.status(201).json(updatedOrder);
            else
                res.status(404).json({error: {message: "No such order found"}});
        } else if (req.body.status === "cancelled") {
            const updatedOrder = await Order.findOneAndUpdate({user: req.body.profile.id, _id: req.params.order_id},
                {$set: {status: req.body.status}}, {new: true});
            if (updatedOrder)
                res.status(201).json(updatedOrder);
            else
                res.status(404).json({error: {message: "No such order found"}});
        } else {
            res.status(400).json({error: {message: "Not an admin neither a cancel operation!"}});
        }
    } catch (e) {
        res.status(500).json(e);
    }
}

exports.createOrder = async (req, res, next) => {
    try {
        const order = Order(
            {
                products: req.body.products,
                address: req.body.address,
                status: 'reviewing',
                user: req.body.profile.id,
            }
        );
        await order.save();
        req.body.order = order;
        next();
    } catch (e) {
        res.status(400).json(e);
    }
}