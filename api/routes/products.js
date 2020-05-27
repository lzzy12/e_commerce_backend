const express = require('express');
const router = express.Router();
const {productController, paginate} = require('../controllers/controller');
const {Product} = require('../models/models');
const multer = require('multer');
const uuid = require('uuid');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, process.env.DATA_STORAGE_LOCATION || 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, uuid.v1() + '-' + file.originalname);
    }
});


const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 100 // 100 MBs
    }
});


router.get('/products', paginate(Product), productController.getAll);

router.post('/products', upload.array('medias'), productController.createProduct);

router.get('/products/:productId', productController.getProductById);

router.put('/products/:productId')
module.exports = router;