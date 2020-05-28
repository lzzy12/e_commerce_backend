const {Order} = require('../models/models');
const nodemailer = require('nodemailer');


function handlePaymentIntent(intent){

}

exports.stripeController = async (req, res, next) => {
    let event = req.body;
    const order_id = event.data.metadata.order_id;
    const customer = event.data.metadata.customer;
    const transporter = nodemailer.createTransport(
        {
            host: process.env.SMTP_SERVER_HOST,
            port: process.env.SMTP_SERVER_PORT,
            secure: true,
            auth: {
                user: process.env.SMTP_SERVER_USERNAME,
                pass: process.env.SMTP_SERVER_PASSWORD
            }
        }
    );
    try {
        switch (event.type) {
            case 'payment_intent.created':
                console.log('Payment initiated');
                return res.sendStatus(200);
            case 'payment_intent.payment_failed':
                await Order.findByIdAndUpdate(order_id,
                    {status: 'cancelled'}, {new: true}).exec();
                await transporter.sendMail({
                    from: process.env.SMTP_SERVER_USERNAME,
                    to: customer.email,
                    subject: `Payment failed for order id ${order_id}`,
                    body: `Payment failed for order id ${order_id}! 
                    Please try again after some time or try a different card`
                });
                return res.sendStatus(200);
            case 'payment_intent.cancelled':
                await Order.findByIdAndUpdate(order_id,
                    {status: 'cancelled'}, {new: true}).exec();
                await transporter.sendMail({
                    from: process.env.SMTP_SERVER_USERNAME,
                    to: customer.email,
                    subject: `Payment failed for order id ${order_id}`,
                    body: `Payment failed for order id ${order_id}! 
                    Please try again after some time or try a different card`
                });
                return res.sendStatus(200);
            case 'payment_intent.succeeded':
                await Order.findByIdAndUpdate(order_id,
                    {status: 'reviewing'}, {new: true}).exec();

                await transporter.sendMail({
                    from: process.env.SMTP_SERVER_USERNAME,
                    to: customer.email,
                    subject: `Payment successful for order id ${order_id}`,
                    body: `We have received your payment for the order id ${order_id}. 
                Your order is now being reviewed. 
                We will notify you once the status of your order changes! Thank you for shopping with us`
                });
                return res.sendStatus(200);
            default:
                return res.sendStatus(401);
        }
    } catch(e){
        console.log(`Post payment actions for order ${order_id} failed: ${e}`);
        res.status(400).json(e);
    }
}