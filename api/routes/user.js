const router = require('express').Router();
const { authController, userController } = require('../controllers/controller');

router.post('/user/register', authController.registerUser);

router.post('/user/login', authController.login);

router.post('/user/address', authController.isAuthenticated, userController.addAddress);

router.put('/user/address', authController.isAuthenticated, userController.editAddress);

module.exports = router;