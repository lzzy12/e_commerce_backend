const app = require('express')();
const {productRoute, categoryRoute, userRoute, orderRoute, promoRoute} = require('./api/routes/routes');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');


const MONGO_DB_URL = process.env.MONGO_DB_URL;
mongoose.connect(MONGO_DB_URL || 'mongodb://localhost:27017/test',
    {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false}).then(() => {
    console.log('Connected to database');
}).catch(e => {
    console.log('Unable to connect to Database: ' + e);
    process.exit();
});

app.use(bodyParser.json());
app.use(morgan('dev'));
app.use('/api/uploads/:filename', (req, res, next) => {
    const rootDir = process.env.DATA_STORAGE_LOCATION || path.join(__dirname, 'uploads');
    const filePath = path.join(rootDir, req.params.filename);
    console.log(filePath);
    if (!fs.existsSync(filePath))
        return res.status(404).json({error: {message: 'File not found'}});
    res.status(200).sendFile(filePath);
});

app.use('/api', productRoute);
app.use('/api', categoryRoute);
app.use('/api', userRoute);
app.use('/api', orderRoute);
app.use('/api', promoRoute);

app.use((req, res, next) => {
    const error = new Error('Resource not found');
    error.status = 404;
    next(error);
});

app.use((error, req, res, next) => {
    if (error) {
        res.status(error.status || 500);
        res.json({
            error: {
                message: error.message
            }
        });
    }
});

module.exports = app;