const { Product } = require('../models/models');


exports.createProduct = (req, res, next) => {
    const product = new Product({
        ...req.body,
        medias: req.files.map((value) =>{
            return {
                mimeType: value.mimetype,
                url: value.path
            }
        })
    });
    product.save().then(result => {
        res.status(201).json(product);
    }).catch(error => {
        res.status(400).json(error);
    });
}

exports.getAll = (req, res, next) => {
    Product.find().select('-__v').then(result => {
        res.status(200).json(result);
    });
}

exports.getProductById = (req, res, next) => {
    const id = req.params.productId;
    Product.findById(id).then(result => {
        if (result) { res.status(200).json(result); }
        else {
            res.status(400).send();
        }

    }).catch(error => {
        res.status(404).json(error);
    });
}