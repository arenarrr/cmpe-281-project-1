const AWS = require('aws-sdk');
const busboy = require('busboy');
const s3 = new AWS.S3();
console.log(s3);
const Bucket_name = "rishikeshcloudprojects.com";
// 4354
exports.handler = async (event, context) => {
    const getFiles = async () => {
        return await s3.listObjectsV2({Bucket: Bucket_name}).promise();
    };


    const deleteFiles = async (name) => {
        return await s3.deleteObject({
            Key: name, Bucket: Bucket_name,
        }).promise();
    };

    const postFiles = async (content, fileName) => {
        return await s3.upload({
            Key: fileName, Bucket: Bucket_name, Body: content,
        }).promise();
    };

    let body = {};
    const res = {
        headers: {
            'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json',
        }, statusCode: 200, body: '',
    };
    try {
        const method = event.httpMethod;
        const path = event.path;
        if (path === '/files') {
            if (method === 'GET') {
                body = await getFiles();
            } else if (method === 'DELETE') {
                const req = JSON.parse(event.body);
                body = await deleteFiles(req.name);
            } else if (method === 'POST') {
                console.log("Debugging");
                const newPromise = new Promise((resolve, reject) => {
                        console.log(event.headers);
                        const contentType = event.headers['Content-Type'] || event.headers['content-type'];
                        console.log(contentType);
                        const bb = busboy({headers: {'content-type': contentType}});
                        let chunks = []
                        let filename = ''
                        let encoding = ''
                        let mimeType = ''
                        console.log("Debugging 3");
                        bb.on('file', (name, file, info) => {
                            console.log("Debugging 4", info);
                            ({filename, encoding, mimeType} = info);
                            console.log(
                                `File [${name}]: filename: %j, encoding: %j, mimeType: %j`,
                                filename,
                                encoding,
                                mimeType
                            );
                            file.on('data', (data) => {
                                chunks.push(data);
                                console.log(`File [${name}] got ${data.length} bytes`);
                            }).on('close', () => {
                                console.log(`File [${name}] done`);
                            });
                        });

                        bb.on('field', (name, val, info) => {
                            console.log(`Field [${name}]: value: %j`, val);
                        });

                        bb.on('close', () => {
                            console.log('Done parsing form!');
                            const buffer = Buffer.concat(chunks);
                            postFiles(buffer, filename).then((data) => {
                                console.log(data);
                                body = data;
                                resolve();
                            });
                        });

                        bb.on('error', err => {
                            console.log('failed', err);
                        });

                        bb.end(event.body);
                    }
                );
                await newPromise;
            }
        }
        res.body = JSON.stringify(body);
    } catch (err) {
        console.log("catching error");
        res.statusCode = 500;
        res.body = JSON.stringify({error: err.message});
        console.log(err)
    }
    return res;
};
