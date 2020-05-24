const express = require('express');
const router = express.Router();
const { productController } = require('../controllers/controller');


router.get('/products', productController.getAll);

router.post('/products', productController.createProduct);

router.get('/products/:productId', productController.getProductById);

module.exports = router;