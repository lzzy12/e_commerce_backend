const router = require('express').Router();
const {stripeController} = require('../controllers/controller');

router.post('/stripe_hook', stripeController.stripeController);

module.exports = router;