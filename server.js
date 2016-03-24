var express = require('express');
var stormpath = require('express-stormpath');
var mysql = require('mysql');

var callouts = require('./lib/modules/callouts');
var routes = require('./lib/routes');


var db = mysql.createConnection({
  host: '127.0.0.1',
  user: 'root',
  password: 'prodigus23',
  database: 'collaborama'
});

// connection.connect();

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

// API routes
app.post('/callouts', function(req, res){
  callouts.create(db, req, res);
});

app.get('/callouts', function(req, res){
  callouts.retrieve(db, req, res);
});

app.get('/callouts/:id', function(req, res){
  callouts.retrieve(db, req, res);
});

app.delete('/callouts/:id', function(req, res){
  callouts.delete(db, req, res);
});

app.put('/callouts/:id', function(req, res){
  callouts.update(db, req, res);
});
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


/**
 * Start the web server.
 */
var port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log('Server listening on http://localhost:' + port);
});

