'use strict';

var bodyParser = require('body-parser');
var express = require('express');
var stormpath = require('express-stormpath');

var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'collaborama'
});

//API Routes 
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
 * Create an Express Router, to contain our custom routes.
 */
var router = express.Router();

/**
 * Define the route for our homepage.
 */

router.get('/', stormpath.getUser, function(req, res) {
  res.render('home');
});

/**
 * When someone visits /profile, render the profile form.
 */

router.get('/profile', stormpath.loginRequired, function(req, res) {
  res.render('profile');
});

/**
 * When someone posts the profile form, read the data and save it to the
 * custom data object on the account.  The body-parser library is used
 * for parsing the form data.
 */

router.post('/profile', bodyParser.urlencoded({extended: false}), stormpath.loginRequired, function(req, res, next) {
  for (var key in req.body) {
    req.user.customData[key] = req.body[key];
  }

  req.user.customData.save(function(err) {
    if (err) {
      return next(err);
    }
    res.render('profile');
  });
});

module.exports = router;
