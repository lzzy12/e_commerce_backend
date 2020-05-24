const app = require('express')();
const {productRoute, categoryRoute} = require('./api/routes/routes');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const morgan = require('morgan');

const MONGO_DB_URL = process.env.MONGO_DB_URL;
mongoose.connect(MONGO_DB_URL || 'mongodb://localhost:27017/test',
    { useNewUrlParser: true, useUnifiedTopology: true }).then(() => {
        console.log('Connected to database');
    }).catch(e => {
        console.log('Unable to connect to Database: ' + e);
        process.exit();
    });

app.use(bodyParser.json());
app.use(morgan('dev'));
app.use('/api', productRoute);
app.use('/api', categoryRoute);
app.use((req, res, next) => {
    const error = new Error('Resource not found');
    res.status = 404;
    next();
});

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    });
});

module.exports = app;