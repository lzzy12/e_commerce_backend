const router = require('express').Router();
const {promoController, authController} = require('../controllers/controller');
const multer = require('multer');
const uuid = require('uuid');
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, process.env.DATA_STORAGE_LOCATION || 'uploads');
    },
    filename: function (req, file, cb) {
        cb(null, uuid.v1() + '-' + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {

    if (file.mimetype === "image/png" || file.mimetype === "image/jpeg" || file.mimetype === "image/gif")
        cb(null, true);

    else
        cb(new Error('File not one of the supported formats: {"image/png", "image/jpeg", "image/gif"}'), false);
}

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5 // 100 MBs
    },
    fileFilter: fileFilter
});

router.get('/promo', promoController.getAllPromo);

router.get('/promo/:id', promoController.getPromoById);

router.post('/promo', authController.isAuthenticated, authController.isAdmin,
    upload.single('pic'), promoController.createPromo);

router.put('/promo/:id', authController.isAuthenticated, authController.isAdmin,
    upload.single('pic'),promoController.updatePromo);

module.exports = router;