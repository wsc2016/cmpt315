var mysql = require('mysql');

var connection = mysql.createConnection({
  host: '127.0.0.1',
  user: 'root',
  password: 'needforspeed666',
  database: 'collaborama',
  multipleStatements:false
});

module.exports = connection;
