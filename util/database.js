const mysql = require("mysql2");
require('dotenv').config()

const pool = mysql.createPool({
  host: process.env.APP_HOST,
  user: process.env.USER,
  database: process.env.DATABASE,
  password: process.env.PASSWORD,
});

pool.on('connection', function (connection) {
  console.log('DB Connection established');
  

  connection.on('error', function (err) {
    console.error(new Date(), 'MySQL error', err.code);
  });
  connection.on('close', function (err) {
    console.error(new Date(), 'MySQL close', err);
  });

});

module.exports = pool.promise();
