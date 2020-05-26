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

exports.getAllOrder = (req, res) => {
    if(req.body.profile.admin === true){
        Order.find().select('-__v').exec().then(orders => {
            res.status(200).json(orders);
        }).catch(error => {
            res.status(500).json(error);
        });
    } else{
        res.status(403).json({error: {message: "Permission denied"}});
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
    } catch(e){
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