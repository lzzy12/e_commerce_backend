module.exports = {
    productController: require('./product'),
    categoryController: require('./category'),
    authController: require('./authentication'),
    userController: require('./user'),
    orderController: require('./order'),
    promoController: require('./promo'),
    stripeController: require('./stripePayment'),
    paginate: require('./pagination'),
}