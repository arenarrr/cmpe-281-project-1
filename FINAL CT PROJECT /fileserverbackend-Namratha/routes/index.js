const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const CONSTANTS = require('../constants');
const db = require('../db');

const router = express.Router();

router.post('/register', function (req, res, next) {
    const post = req.body;

    const {email, password, firstName, lastName} = post;

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    const sql = 'INSERT INTO users (email, password, firstName, lastName) VALUES (?, ?, ?, ?)';

    db.query(sql, [email, hashedPassword, firstName, lastName], function (err, result) {
        if (err) {
            console.log(err);
            res.json({
                error: "Error while registering user"
            });
        } else {
            res.json({
                success: true
            });
        }
    });


});

router.post('/login', function (req, res, next) {
    const post = req.body;
    const {email, password} = post;

    const sql = 'SELECT * FROM users WHERE email = ?';
    db.query(sql, [email], function (err, result) {
        if (err) {
            console.log(err);
            res.json({
                error: "Error while logging in user"
            });
        } else {
            if (result.length === 1) {
                const user = result[0];
                const isPasswordCorrect = bcrypt.compareSync(password, user.password);
                if (isPasswordCorrect) {
                    // return jwt token
                    const token = jwt.sign({email: user.email}, CONSTANTS.privateKey, {expiresIn: 86400});
                    res.json({
                        success: true, token: token
                    });
                } else {
                    res.json({
                        error: "Wrong password"
                    });
                }
            } else {
                res.json({
                    error: "User not found"
                });
            }
        }
    });
});
module.exports = router;
