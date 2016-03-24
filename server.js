'use strict';

var express = require('express');
var stormpath = require('express-stormpath');
var mysql = require('mysql');

var connection = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: 'password',
	database: 'collaborama'
});

connection.connect();
var routes = require('./lib/routes');

/**
 * Create the Express application.
 */
var app = express();

/**
 * Application settings.
 */
app.set('trust proxy',true);
app.set('view engine', 'jade');
app.set('views', './lib/views');
app.locals.siteName = 'Collaborama';

/**
 * Stormpath initialization.
 */

console.log('Initializing Stormpath');

app.use(stormpath.init(app, {
  expand: {
    customData: true
  }
}));

/**
 * Route initialization.
 */
app.use('/', routes);

app.on('stormpath.ready',function () {
  console.log('Stormpath Ready');
});

var callout = {
	userid: '123',
	message: 'testing testing',
	city: 'Edmonton',
	genre: 'Hiphop',
	likes: '34',
}
connection.query('insert into callouts set ?', callout, function(err, result){
	console.log(query.sql);
	if (err){
		console.error(err);
		return;
	}
	console.error(result);
});

/**
 * Start the web server.
 */
var port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log('Server listening on http://localhost:' + port);
});

