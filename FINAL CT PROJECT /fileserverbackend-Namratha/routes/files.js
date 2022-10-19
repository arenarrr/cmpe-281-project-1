const express = require('express');
const axios = require('axios');
const router = express.Router();
const db = require('../db');
const fs = require("fs");
const CONSTANTS = require("../constants");
const FormData = require('form-data');

router.get('/', async function (req, res, next) {
    const email = req.email;
    db.query('SELECT * FROM users WHERE email = ?', [email], function (err, user) {
        if (user?.length === 1) {
            if (user[0].isAdmin) {
                db.query('SELECT * FROM files', function (err, files) {
                    res.json({
                        success: true, files: files?.map(file => {
                            delete file.userId;
                            return file;
                        })
                    });
                });
            } else {
                db.query('SELECT * FROM files WHERE userId = ?', [user[0].id], function (err, files) {
                    res.json({
                        success: true, files: files?.map(file => {
                            delete file.userId;
                            return file;
                        })
                    });
                });
            }
        } else {
            res.json({
                error: "User not found"
            });
        }
    });
});

router.post('/', async function (req, res, next) {
        try {
            const email = req.email;
            const fields = {}

            if (req.busboy) {
                req.pipe(req.busboy);

                req.busboy.on('field', function (fieldname, val) {
                    console.log("Field [" + fieldname + "]: value: " + val);
                    fields[fieldname] = val;
                });

                req.busboy.on('file', async function (fieldname, file, info) {
                    // save file to disk
                    const fileName = info.filename;

                    const folder = CONSTANTS.uploadFolder;
                    if (!fs.existsSync(folder)) {
                        fs.mkdirSync(folder);
                    }

                    const filePath = `${folder}/${fileName}`;
                    let fileStream
                    // check if file exists
                    if (fs.existsSync(filePath)) {
                        fileStream = fs.createWriteStream(filePath, {flags: 'w'});
                    } else {
                        fileStream = fs.createWriteStream(filePath, {flags: 'wx'});
                    }
                    file.pipe(fileStream);

                    const form_data = new FormData();
                    form_data.append('file', fs.createReadStream(filePath), fileName);

                    // Forwards file to the file server
                    const response = await axios.post(CONSTANTS.lambdaUrl, form_data, {
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        }
                    });

                    const sql = 'INSERT INTO files (userId, fileName, filePath, description) VALUES ((select id from users where email = ?), ?, ?, ?)';
                    // const uploadTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
                    db.query(sql, [email, fileName, response.data?.Location, fields["description"]], function (err, result) {
                            console.log("result", {result})
                            if (err) {
                                console.log(err);
                                res.json({
                                    error: "Error while uploading file"
                                });
                            } else {
                                res.json({
                                    success: true
                                });
                            }
                        }
                    );
                });
            } else {
                res.json({
                    error: "Error while uploading file"
                });
            }
        } catch (e) {
            console.log("Here", e);
            res.json({
                error: "Error while uploading file"
            });
        }
    }
);


router.put('/:id', async function (req, res, next) {
    const email = req.email;
    const id = req.params.id;
    const fields = {}
    if (req.busboy) {
        req.pipe(req.busboy);

        req.busboy.on('field', function (fieldname, val) {
            console.log("Field [" + fieldname + "]: value: " + val);
            fields[fieldname] = val;
        });

        req.busboy.on('file', async function (fieldname, file, info) {
            // save file to disk
            const fileName = info.filename;

            const folder = CONSTANTS.uploadFolder;
            try {
                if (!fs.existsSync(folder)) {
                    fs.mkdirSync(folder);
                }
                const filePath = `${folder}/${fileName}`;
                const fileStream = fs.createWriteStream(filePath, {flags: 'w'});
                file.pipe(fileStream);

                const form_data = new FormData();
                form_data.append('file', fs.createReadStream(filePath), fileName);
                const response = await axios.post(CONSTANTS.lambdaUrl, form_data, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });

                // delete file from disk
                fs.unlinkSync(filePath);
                const sql = 'UPDATE files SET fileName = ?, filePath = ?, description = ? WHERE id = ? AND userId = (select id from users where email = ?)';
                db.query(sql, [fileName, response.data?.Location, fields["description"], id, email], function (err, result) {
                        if (err) {
                            console.log(err);
                            res.json({
                                error: "Error while uploading file"
                            });
                        } else {
                            res.json({
                                success: true
                            });
                        }
                    }
                );
            } catch (e) {
                console.log("Here", e);
                res.json({
                    error: "Error while uploading file"
                });
            }
        });
    } else {
        res.json({
            error: "Error while uploading file"
        });
    }
});

router.delete('/:id', async function (req, res, next) {
    const email = req.email;
    const id = req.params.id;
    // get the file
    db.query('SELECT * FROM files WHERE id = ? AND userId = (select id from users where email = ?)', [id, email], function (err, file) {
        if (file?.length === 1) {
            axios.delete(`${CONSTANTS.lambdaUrl}`, {
                data: {
                    name: file[0].fileName
                }
            }).then((response) => {
                if (response.status === 200) {
                    const sql = 'delete from files where id = ? and userId = (select id from users where email = ?)';
                    db.query(sql, [id, email], function (err, result) {
                        if (err) {
                            console.log(err);
                            res.json({
                                error: "Error while deleting file"
                            });
                        } else {
                            res.json({
                                success: true
                            });
                        }
                    });
                }
            });
        }
    });
});


module.exports = router;
