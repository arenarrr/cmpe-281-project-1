// connect to the mysql database
const mysql = require('mysql');

let config = require('./config/dev.json');

// TODO - Set process env variables for production
if(process.env.NODE_ENV === 'production') {
    config = require('./config/prod.json');
}


const connection = mysql.createConnection(config);

// connect to the database
connection.connect(function (err) {
    if (err) {
        console.error('error connecting: ' + err.stack);
        return;
    }
    console.log('connected as id ' + connection.threadId);
});

// export the connection
module.exports = connection;

