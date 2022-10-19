const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const jwt = require('jsonwebtoken');
const busboy = require("connect-busboy");
const CONSTANTS = require('./constants');
const indexRouter = require('./routes/index');
const filesRouter = require('./routes/files');

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(busboy());

app.use('/', indexRouter)


function errorHandler(err, req, res, next) {
    if (res.headersSent) {
        return next(err)
    }
    res.status(500)
    res.render('error', {error: err})
}

app.use(errorHandler)
// authentication middleware

app.use(function (req, res, next) {
    let token = req.headers['authorization'];
    console.log({token});
    token = token.replace('Bearer ', '');
    if (token) {
        jwt.verify(token, CONSTANTS.privateKey, function (err, decoded) {
            console.log({err, decoded});
            if (err) {
                res.json({
                    error: "Failed to authenticate token"
                });
            } else {
                req.email = decoded?.email;
                next();
            }
        });
    } else {
        res.json({
            error: "No token provided"
        });
    }
});

app.use('/files', filesRouter)


module.exports = app;

// 1. backend - registration, login, list files, list all for admins
