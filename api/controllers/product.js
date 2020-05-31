const { Product } = require('../models/models');


exports.createProduct = (req, res, next) => {
    const product = new Product({
        ...req.body,
        medias: req.files.map((value) =>{
            return {
                mimeType: value.mimetype,
                url: `/api/uploads/${value.filename}`
            }
        })
    });
    product.save().then(result => {
        res.status(201).json(product);
    }).catch(error => {
        res.status(400).json(error);
    });
}

exports.getAll = async (req, res, next) => {
    const orderBy = req.query.orderBy;
    const category = req.query.category;
    let find = {};
    if (category)
        find = {categories: category}
    console.log(orderBy);
    try {
        res.result.results = await Product.find(find)
            .sort(`${orderBy}`)
            .skip(res.limits.startIndex)
            .select('-__v')
            .limit(res.limits.pageSize)
            .populate('categories')
            .exec();
        res.status(200).json(res.result);
    } catch(e){
        res.status(400).json(e);
    }
}

exports.getProductById = (req, res, next) => {
    const id = req.params.productId;
    Product.findById(id).populate('categories').then(result => {
        if (result) { res.status(200).json(result); }
        else {
            res.status(400).send();
        }

    }).catch(error => {
        res.status(404).json(error);
    });
}

exports.updateProduct = async (req, res, next) => {
    try {
        const id = req.params.productId;
        const updatedDoc = await Product.findOneAndUpdate({_id: id}, req.body, {new: true});
        res.status(201).json(updatedDoc);
    } catch(e){
        res.status(400).json(e);
    }
}

exports.deleteProduct = async (req, res, next) => {
    try {
        const id = req.params.productId;
        await Product.findByIdAndDelete(id).exec();
        res.sendStatus(204);
    } catch(e){
        res.status(400).json(e);
    }
}