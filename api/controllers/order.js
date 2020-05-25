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
    Order.find().select('-__v').exec().then(orders => {
        res.status(200).json(orders);
    }).catch(error => {
        res.status(500).json(error);
    });
}

exports.updateStatus = (req, res) => {
    Order.updateOne({_id: req.params.order_id}, {$set: {status: req.body.status}}, (err, order) => {
        if (err) {
            return res.status(400).json(err);
        }
        res.status(201).json({message: "Update successful"});
    });
}

exports.createOrder = async (req, res) => {
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
        res.status(201).json(order);
    } catch (e) {
        res.status(400).json(e);
    }
}