const { Order, Product, Promo, User } = require('../models/models');
const { orderStatus } = require('../models/order');
const stripe = require('stripe')(process.env.STRIPE_API_KEY);

exports.getOrderById = async (req, res) => {
    try {
        const order = await Order.findOne({ _id: req.params.order_id }).select('-__v')
            .populate('promo products.product')
            .exec();
        if (order) {
            res.status(200).json(order);
        } else {
            res.status(404).json({ error: { message: "Order not found" } });
        }
    }
    catch (e) {
        res.status(500).json(e);
    }
}

exports.getAllOrder = async (req, res) => {
    try {
        if (req.body.profile.admin === true) {
            res.result.results = await Order.find().limit(res.limits.pageSize)
                .skip(res.limits.startIndex)
                .select('-__v')
                .populate('promo products.product').exec();
        } else {
            res.result.results = await Order.find({ user: req.body.profile.id }).select('-__v').exec();
        }
        res.status(200).json(res.result);
    } catch (error) {
        res.status(500).json(error);
    }
}

exports.getAllOrderByUser = (req, res) => {
    Order.find({ user: req.body.profile.id }).select('-__v').populate('promo').exec().then(orders => {
        res.status(200).json(orders);
    }).catch(error => {
        res.status(500).json(error);
    });
}

exports.updateStatus = async (req, res) => {
    try {
        if (req.body.admin) {
            const updatedOrder = await Order.findOneAndUpdate({ _id: req.params.order_id },
                { $set: { status: req.body.status } }, { new: true });
            if (updatedOrder)
                res.status(201).json(updatedOrder);
            else
                res.status(404).json({ error: { message: "No such order found" } });
        } else if (req.body.status === orderStatus.cancelled) {
            const updatedOrder = await Order.findOneAndUpdate({ user: req.body.profile.id, _id: req.params.order_id },
                { $set: { status: req.body.status } }, { new: true });
            if (updatedOrder)
                res.status(201).json(updatedOrder);
            else
                res.status(404).json({ error: { message: "No such order found" } });
        } else {
            res.status(400).json({ error: { message: "Not an admin neither a cancel operation!" } });
        }
    } catch (e) {
        res.status(500).json(e);
    }
}

exports.createOrder = async (req, res, next) => {
    try {
        const products = await Product.find({
            _id:
                { $in: req.body.products.map(value => value.product) }
        }).populate('categories').exec();
        if (products.length < req.body.products.length)
            return res.status(400).json({error: {message: 'One or more product ids are invalid'}});
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
                status: orderStatus.processing,
                user: req.body.profile.id,
                promo: req.body.promo,
            }
        );

        let totalAmount = 0.0;
        for (let i of products) {
            totalAmount += i.price;  // Redundant warning in WebStorm: Ignore
        }
        if (req.body.promo) {
            try {
                const promo = await Promo.findById(req.body.promo).exec();
                if (!promo) {
                    return res.status(400).json(Error('Invalid promo code'));
                }
                let discount = (promo.discount_percent / 100) * totalAmount;
                if (discount > promo.discount_upto)
                    discount = promo.discount_upto;
                totalAmount -= discount;
            } catch (e) {
                return res.status(400).json(e);
            }
        }

        await order.save();
        const user = await User.findById(req.body.profile.id)
            .select('email _id first_name last_name phone_num').exec();
        let customer = await stripe.customers.retrieve(user._id.toString());
        if (!customer) {
            customer = await stripe.customers.create({
                email: user.email,
                id: user._id.toString(),
                name: user.first_name + user.last_name,
                phone: user.phone_num,
            });
        }
        const paymentIntent = await stripe.paymentIntents.create({
            amount: totalAmount * 100,  // In Indian paise
            currency: 'inr',
            description: `Payment of ${totalAmount} by ${req.body.profile.email} at ${Date.now()}`,
            setup_future_usage: 'on_session',
            customer: customer.id,
            metadata: {
                order_id: order._id.toString(),
                customer_id: req.body.profile.id,
                customer_email: req.body.profile.email
            }
        });
        order.products = order.products.map((value, i) => {
            return products[i];
        });
        const client_secret = paymentIntent.client_secret;
        req.result = {
            publishable_key: process.env.STRIPE_PUBLISHABLE_KEY,
            client_secret, order:{
                products: order.products.map((value, i) => {
                    return products[i];
                }),
                _id: order._id,
                status: order.status,
                address: order.address,
                createdAt: order.createdAt,
                updatedAt: order.updatedAt
            },
        };
        next();
    } catch (e) {
        console.log(e);
        res.status(400).json(e);
    }
}