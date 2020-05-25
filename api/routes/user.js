const router = require('express').Router();
const { authController } = require('../controllers/controller');

router.post('/user/register', authController.registerUser);

router.post('/user/login', authController.login);

module.exports = router;
