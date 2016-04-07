var express = require('express');
var stormpath = require('express-stormpath');
var mysql = require('mysql');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');

var logger = require('morgan');
var cookieParser = require('cookie-parser');
var favicon = require('serve-favicon');
var path = require('path');


var songs = require('./lib/modules/songs');
var callouts = require('./lib/modules/callouts');
var conversations = require('./lib/modules/conversations');
var routes = require('./lib/routes');

var db = mysql.createConnection({
  host: '127.0.0.1',
  user: 'root',
  password: 'needforspeed666',
  database: 'collaborama'
});

/**
 * Create the Express application and socket.io server.
 */
//var app = express()
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

/**
 * Stormpath initialization.
 */

console.log('Initializing Stormpath');

app.use(stormpath.init(app, {
  expand: {
    customData: true
  },
  web: {
    register: {
      form:{
        fields:{
          city:{
            enabled: true,
            label: 'City',
            name: 'city',
            required: true,
            type: 'text'
          },
          genre:{
            enabled: true,
            label: 'Preferred Genre',
            name: 'genre',
            required: true,
            type: 'text'
          },
        }  
      }
    }
  }

}));

/**
 * Application settings.
 */
app.set('trust proxy',true);
app.set('view engine', 'jade');
// app.set('views', './lib/views');
app.set('views', path.join(__dirname, './lib/views'));
app.locals.siteName = 'Collaborama';

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(methodOverride('_method'));

// API routes
app.post('/callouts', function(req, res){
  callouts.create(db, req, res);
});


// app.get('/callouts/:id', function(req, res){
//   callouts.retrieve(db, req, res);
// });

// app.delete('/callouts/id',stormpath.getUser, function(req, res){
//   console.log('server');
//   callouts.delete(db, req, res);
// });

app.put('/callouts/:id', function(req, res){
  console.log('serverjs');
  callouts.update(db, req, res);
});


app.get('/songs', function(req, res) {
  songs.retrieve_all(db, req, res);
});

app.post('/songs', function(req, res) {
  songs.create(db, req, res);
});

app.get('/songs/:id', function(req, res) {
  songs.retrieve(db, req, res);
});

app.delete('/songs/:id', function(req, res) {
  songs.delete(db, req, res);
});

app.get('/users/:userID/conversations',stormpath.getUser, function(req,res){
  conversations.retrieve_conversations(db,req,res);
});

app.post('/users/:userID/conversations', function(req,res){
  conversations.create_conversation(db,req,res);
});

app.get('/users/:userID/conversations/:conversationID',stormpath.getUser, function(req,res){
  //console.log("THE CONVERSATION ID IS: "+req.params.conversationID);
  conversations.retrieve_messages(db,req,res);
});

app.post('/users/:userID/conversations/:conversationID',stormpath.getUser, function(req,res){
  conversations.create_message(db,req,res);
});


/**
 * Route initialization.
 */
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'lib')));
app.use(express.static(path.join(__dirname, 'node_modules')));
app.use(express.static(path.join(__dirname, 'lib/css')));
app.use('/', routes);

app.on('stormpath.ready',function () {
  console.log('Stormpath Ready');
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

/**
 * Handle chat connection
 */
io.on('connection',function(socket){
  console.log('a user connected');
});

/**
 * Start the web server. server.listen not app.listen for chat.io
 */
var port = process.env.PORT || 3000;
server.listen(port,function(){
  console.log('Server listening on http://localhost:' + port);
});
