const {Order, Product, Promo} = require('../models/models');
const stripe = require('stripe')(process.env.STRIPE_API_KEY);

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
        const products = await Product.find({
            _id:
                {$in: req.body.products.map(value => value.product)}
        })
            .select('_id price').exec();
        const order = new Order(
            {
                products: products.map((value, index) => {
                    return {
                        product: value._id,
                        amount: req.body.products[index].amount,
                        price: value.price
                    }
                }),
                address: req.body.address,
                status: 'processing',
                user: req.body.profile.id,
                promo: req.body.promo,
            }
        );
        let totalAmount = 0.0;
        for (let i of products) {
            totalAmount += i.price;  // Redundant warning in WebStorm: Ignore
        }
        const promo = await Promo.findById(req.body.promo).exec();
        if (!promo)
            return res.status(400).json(Error('Invalid promo code'));
        let discount = (promo.discount_percent / 100) * totalAmount;
        if (discount > promo.discount_upto)
            discount = promo.discount_upto;
        totalAmount -= discount;
        await order.save();
        await stripe.customers.create({
            email: req.body.profile.email,
            source: req.body.profile.id,
        });
        const paymentIntent = await stripe.paymentIntents.create({
            amount: totalAmount,
            currency: 'inr',
            description: `Payment of ${totalAmount} by ${req.body.profile.email} at ${Date.now()}`,
            metadata: {
                order_id: order._id, customer: {
                    email: req.body.profile.email,
                    id: req.body.profile.id,
                }
            }
        });
        const client_secret = paymentIntent.client_secret;
        res.result = {
            publishable_key: process.env.STRIPE_PUBLISHABLE_KEY,
            client_secret, order,
        };
        next();
    } catch (e) {
        res.status(400).json(e);
    }
}