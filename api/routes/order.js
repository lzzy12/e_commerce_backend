const router = require('express').Router();
const {orderController, authController} = require('../controllers/controller');

router.get('/order/:order_id', authController.isAuthenticated, orderController.getOrderById);

router.get('/order', authController.isAuthenticated, orderController.getAllOrder);

router.post('/order', authController.isAuthenticated, orderController.createOrder);

router.put('/order/:order_id', authController.isAuthenticated, authController.isAdmin, orderController.updateStatus);

module.exports = router;