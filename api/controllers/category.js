const mongoose = require('mongoose');
const { Category } = require('../models/models');

// Lists all the categories if `only` is not defined. 
//If `only` is defined lists only categories with ids in only list.
exports.getAllOrByIdList = (req, res, next) => {
    if (req.body.only && req.body.only instanceof Array) {
        Category.find({
            _id: {
                $in: req.body.only
            }
        }).then(result => {
            return res.status(200).json(result);
        }).catch(error => {
            return res.status(400).json(error);
        });
    } else {
        Category.find({}).then(result => {
            res.status(200).json(result);
        }).catch(error => {
            res.status(400).json(error);
        });
    }
}

exports.createCategory = (req, res, next) => {
    const category = new Category(req.body);
    category.save().then(result => {
        res.status(201).json(result);
    }).catch(error => {
        res.status(400).json(error);
    });
}

exports.getCategoryById = (req, res, next) => {
    const id = req.params.id;
    Category.find({ _id: id }).then(result => {
        if (result.length > 0) {
            res.status(result.length > 0 ? 200 : 404).json(result);
        }
    });
}