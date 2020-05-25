const router = require('express').Router();
const { userController } = require('../controllers/controller');

router.post('/user/register', userController.registerUser);

router.post('/user/login', userController.login);

module.exports = router;
