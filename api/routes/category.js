const router = require('express').Router();
const {categoryController } = require('../controllers/controller');

router.get('/category', categoryController.getAllOrByIdList);

router.post('/category', categoryController.createCategory);

router.get('/category/:id', categoryController.getCategoryById);

module.exports = router;