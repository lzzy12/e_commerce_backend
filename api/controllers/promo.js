const {Promo} = require('../models/models');

exports.getAllPromo = async (req, res) => {
    try {
        res.result.results = await Promo.find()
            .limit(res.limits.pageSize)
            .skip(res.limits.startIndex)
            .select('-__v').exec();

        res.status(200).json(res.result);
    } catch (e) {
        res.status(500).json(e);
    }
}

exports.getPromoById = (req, res) => {
    Promo.findById(req.params.id).select('-__v').exec((err, promo) => {
        if (err) return res.status(400).json(err);
        res.status(201).json(promo._doc);
    });
}

exports.createPromo = (req, res) => {
    const promo = Promo({
        code: req.body.code,
        discount_percent: req.body.discount_percent,
        description: req.body.description,
        discount_upto: req.body.discount_upto,
        expiryDate: req.body.expiryDate,
        pic: `/api/uploads/${req.file.filename}`
    });
    promo.save(err => {
        if (err) return res.status(400).json(err);
        res.status(201).json(promo._doc);
    });
}

exports.updatePromo = async (req, res) => {
    const id = req.params.id;
    if (req.file)
        req.body.pic = `/uploads/${req.file.filename}`;
    Promo.findByIdAndUpdate(id, req.body, {new: true}).exec((err, updated) => {
        if (err) return res.status(400).json(err);
        res.status(201).json(updated._doc);
    });
}