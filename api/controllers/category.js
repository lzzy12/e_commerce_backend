const mongoose = require('mongoose');
const { Category } = require('../models/models');

// Lists all the categories if `only` is not defined. 
//If `only` is defined lists only categories with ids in only list.
exports.getAllOrByIdList = async (req, res, next) => {
    try {
        if (req.body.only && req.body.only instanceof Array) {
            await Category.find({
                _id: {
                    $in: req.body.only
                }
            }).limit(res.limits.pageSize)
                .skip(res.limits.startIndex).select('-__v').exec();
        } else {
            res.result.results = await Category.find().limit(res.limits.pageSize)
                .skip(res.limits.startIndex).select('-__v').exec();
        }
        res.status(200).json(res.result);
    } catch (e) {
        res.status(500).json(e);
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