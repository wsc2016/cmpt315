'use strict';

var bodyParser = require('body-parser');
var express = require('express');
var stormpath = require('express-stormpath');

var mysql = require('mysql');
var db = mysql.createConnection({
  host: '127.0.0.1',
  user: 'root',
  password: 'root,
  database: 'collaborama'
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

/**
 * Define the routes for exploring songs.
 */

router.get('/explore', stormpath.getUser, function (req, res, next) {
  //randomly play a song
  db.query(
    "SELECT * from songs ORDER BY rand() LIMIT 1", function(err, rows) {
      res.render('explore', { url: JSON.stringify(rows[0].soundcloudurl), 
                              name: rows[0].songname
                            });
    });
});

router.get('/explore/:id', stormpath.getUser, function (req, res, next) {
  //play a song based on id
  db.query(
      "SELECT * from songs WHERE id = ?", [req.params.id], function(err, rows) {
        res.render('explore', { url: JSON.stringify(rows[0].soundcloudurl), 
                                name: rows[0].songname 
                              });
      });
});

module.exports = router;