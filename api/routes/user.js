const router = require('express').Router();
const { authController, userController, paginate } = require('../controllers/controller');
const {User} = require('../models/models');

router.post('/user/register', authController.registerUser);

router.post('/user/login', authController.login);

router.get('/users', authController.isAuthenticated, authController.isAdmin, paginate(User), userController.getAllUsers);

router.post('/user/address', authController.isAuthenticated, userController.addAddress);

router.put('/user/address', authController.isAuthenticated, userController.editAddress);

module.exports = router;