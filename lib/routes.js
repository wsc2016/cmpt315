'use strict';

var bodyParser = require('body-parser');
var express = require('express');
var stormpath = require('express-stormpath');


var mysql = require('mysql');
var db = mysql.createConnection({
  host: '127.0.0.1',
  user: 'root',
  password: 'prodigus23',
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

router.get('/callouts', stormpath.getUser, function(req, res) {
  db.query(
      "SELECT * from callouts WHERE city='"+req.user.customData.city+"' ORDER BY ts DESC", function(err, rows) {
        if (err) {
            res.json({
                statusCode: 500,
                message: "Failed to retrieve all callouts "+ err
            });
        }
        var messages = [];

        for (var i = 0; i < rows.length; i++){
          if(rows[i] !== null)
            messages.push(rows[i]);
        }

        res.render('callouts', {
          statusCode: 200,
          messages: JSON.stringify(messages),
        });
      });
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
 * Define the route for exploring songs.
 */

router.get('/explore', stormpath.getUser, function (req, res, next) {
  //randomly choose an id and redirect the route
  db.query(
    "SELECT * from songs ORDER BY rand() LIMIT 1", function(err, rows) {
      res.redirect('/explore/' + rows[0].id);
    });
});

router.get('/explore/:id', stormpath.getUser, function (req, res, next) {
  //play a song based on the randomly selected song
  db.query(
      "SELECT * FROM songs WHERE id = ?", [req.params.id], function(err, rows) {
        res.render('explore', { url: JSON.stringify(rows[0].soundcloudurl), 
                                name: rows[0].songname
                              });
      });
});



/**
 * Define the routes for displaying song lists, showing song info, and playing songs  
 */

router.get('/music', stormpath.getUser, function (req, res, next) {
  //show a table with all songs that pass the filter
  db.query(
    "SELECT songname, genre, city, soundcloudurl FROM songs INNER JOIN users ON songs.userid=users.id", function(err, rows1) {
      
      var genres = [];
      var cities = [];
      for(var i = 0; i < rows1.length; i++) {
        if(rows1[i].genre !== null)
          genres.push(rows1[i].genre);
        if(rows1[i].city !== null)
          cities.push(rows1[i].city);
      }

      function getUnique(value, index, self) { 
          return self.indexOf(value) === index;
      }

      function filterQuery(query_string, filters) {
        db.query(
          query_string, 
          filters, 
          function(err, rows2) {
            res.render('music', { entries: rows1,
                                  query_entries: rows2,
                                  default_genre: req.query.genre,
                                  default_city: req.query.city,
                                  unique_genres: genres.filter(getUnique),
                                  unique_cities: cities.filter(getUnique)
                                });
          });
      }

      var query_string =  "SELECT songname, genre, city, soundcloudurl, songs.id FROM songs INNER JOIN users ON songs.userid=users.id";
      if(req.query.genre && req.query.city) {
        query_string = query_string + " WHERE city=? AND genre=?";
        var filters = [req.query.city, req.query.genre];
        filterQuery(query_string, filters);
      }
      else if(req.query.genre) {
        query_string = query_string + " WHERE genre=?";
        var filters = [req.query.genre];
        filterQuery(query_string, filters);
      }
      else if(req.query.city) {
        query_string = query_string + " WHERE city=?";
        var filters = [req.query.city];
        filterQuery(query_string, filters);
      }
      else {
        var filters = [];
        filterQuery(query_string, filters);
      }
    });

});

module.exports = router;