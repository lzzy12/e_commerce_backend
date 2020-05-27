module.exports = (model) => {
    return async (req, res, next) => {
        try {
            const docCount = await model.countDocuments().exec();
            const pageSize = parseInt(req.query.pageSize || docCount);
            const page = parseInt(req.query.page || 1);
            const startIndex = (page - 1) * pageSize;
            const endIndex = page * pageSize;
            const result = {};
            if (startIndex > 1)
                result.previous = {
                    page: page - 1,
                }
            if (docCount > endIndex)
                result.next = {
                    page: page + 1,
                }
            result.totalPages = Math.floor(docCount / pageSize);
            res.limits = {
                startIndex,
                endIndex,
                pageSize
            }
            res.result = result;
            next();
        } catch(e){
            res.status(500).json(e);
        }
    }
}