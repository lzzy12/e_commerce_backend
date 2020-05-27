const router = require('express').Router();
const {categoryController, paginate } = require('../controllers/controller');
const {Category} = require('../models/models');

router.get('/category', paginate(Category), categoryController.getAllOrByIdList);

router.post('/category', categoryController.createCategory);

router.get('/category/:id', categoryController.getCategoryById);

module.exports = router;