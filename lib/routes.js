'use strict';

var bodyParser = require('body-parser');
var express = require('express');
var stormpath = require('express-stormpath');
var db = require('./modules/db');

var mysql = require('mysql');
var db = mysql.createConnection({
  host: '127.0.0.1',
  user: 'root',
  password: 'prodigus23',
  database: 'collaborama',
  multipleStatements: true
});


/**
 * Create an Express Router, to contain our custom routes.
 */
var router = express.Router();
var conversations = require('../lib/modules/conversations');
var callouts = require('../lib/modules/callouts');

/**
 * Define the route for our homepage.
 */

router.get('/', stormpath.getUser, function(req, res) {
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

      res.render('home', {
        statusCode: 200,
        messages: JSON.stringify(messages),
      });
    });

  db.query(
    "INSERT INTO users (id, firstName, lastName, city, genre) VALUES (?, ?, ?, ?, ?)", [req.user.email, req.user.givenName, req.user.surname, req.user.customData.city, req.user.customData.genre], function(err) {
        if (err) {
            res.render('home',{
                statusCode: 500,
                message: "Failed to insert user"
            })
        }
  });

});


/**
 * When someone visits /profile, render the profile form.
 */

router.get('/profile', stormpath.loginRequired, function(req, res) {
  db.query(
    "SELECT * FROM users WHERE id = ?", req.user.email, function(err, rows1){
        db.query(
          "SELECT * FROM songs WHERE userid = ?", req.user.email, function(err, rows2){
            if (err) {
                res.json({
                    statusCode: 500,
                    message: "Failed to retrieve all user"+ err
                });
            }
            var user = [];
            user.push(rows1[0]);

            res.render('profile',{
              statusCode: 200,
              user: JSON.stringify(user),
              userid: req.user.email,
              query_entries: rows2
            });

        });
    });
});

/**
 * When someone posts the profile form, read the data and save it to the
 * custom data object on the account.  The body-parser library is used
 * for parsing the form data.
 */

router.post('/profile', stormpath.loginRequired, function(req, res){
  //update stormpath database
  for (var key in req.body) {
    req.user.customData[key] = req.body[key];
  }

  req.user.customData.save(function(err) {
    if (err) {
      return next(err);
    }
  });
  //update local user database
  db.query(
    "UPDATE users SET city=?, genre=? WHERE id=?", [req.body.city, req.body.genre, req.body.email], function(err, rows){
      if (err) {
          res.json({
              statusCode: 500,
              message: "Failed to update user"+ err
          });
      }
      res.redirect('profile');
    });
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

router.get('/callouts/:id', stormpath.getUser, function(req, res){
  db.query(
      "SELECT * from callouts WHERE id = ?", [req.params.id], function(err, rows) {
          if (err) {
              res.json({
                  statusCode: 500,
                  message: "Failed to retrieve all callout"
              });
          }
          var owner = false;

          if (rows[0].userid === req.user.email){
            owner = true;
          }
          
          var messages=[];
          messages.push(rows[0]);

          res.render('callouts',{
            statusCode:200,
            messages: JSON.stringify(messages),
            own: owner,
          });
      });
});

router.get('/callouts/delete/:id', stormpath.getUser, function(req, res){
  callouts.delete(db, req, res);
});

router.get('/callouts/edit/:id',stormpath.getUser, function(req, res){
  callouts.update(db, req, res);
});

router.post('/callouts/edit/:id',stormpath.getUser, function(req, res){
  console.log('routesjs');
  callouts.update(db, req, res);
});


/**
 * Define the route for exploring songs.
 */

router.get('/explore', stormpath.getUser, function (req, res, next) {
  //randomly choose an id based on filters and render explore view

  db.query(
    "SELECT songname, songs.genre, city, soundcloudurl FROM songs INNER JOIN users ON songs.userid=users.id", function(err, rows1) {
      
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
            if(rows2[0]) {
              res.render('explore', { url: JSON.stringify(rows2[0].soundcloudurl), 
                                      name: rows2[0].songname,
                                      artist: rows2[0].firstName,
                                      email: rows2[0].userid,
                                      default_genre: req.query.genre,
                                      default_city: req.query.city,
                                      unique_genres: genres.filter(getUnique),
                                      unique_cities: cities.filter(getUnique)
                                    });
            }
            else {
              res.render('explore', { default_genre: req.query.genre,
                                       default_city: req.query.city,
                                       unique_genres: genres.filter(getUnique),
                                       unique_cities: cities.filter(getUnique)
                                     });
            }
          });
      }

      var query_string =  "SELECT * FROM songs INNER JOIN users ON songs.userid=users.id";
      if(req.query.genre && req.query.city) {
        query_string = query_string + " WHERE city=? AND songs.genre=?";
        var filters = [req.query.city, req.query.genre];
      }
      else if(req.query.genre) {
        query_string = query_string + " WHERE songs.genre=?";
        var filters = [req.query.genre];
      }
      else if(req.query.city) {
        query_string = query_string + " WHERE city=?";
        var filters = [req.query.city];
      }
      else {
        var filters = [];
      }
      query_string = query_string + " ORDER BY rand() LIMIT 1"
      filterQuery(query_string, filters);
    });
});


/**
 * Define the routes for displaying song lists, showing song info, and playing songs  
 */

router.get('/music', stormpath.getUser, function (req, res, next) {
  //show a table with all songs that pass the filter
  db.query(
    "SELECT songname, songs.genre, city, soundcloudurl FROM songs INNER JOIN users ON songs.userid=users.id", function(err, rows1) {
      
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
            res.render('allmusic', { entries: rows1,
                                     query_entries: rows2,
                                     default_genre: req.query.genre,
                                     default_city: req.query.city,
                                     unique_genres: genres.filter(getUnique),
                                     unique_cities: cities.filter(getUnique)
                                });
          });
      }

      var query_string =  "SELECT songname, songs.genre, city, soundcloudurl, songs.id, userid, firstName FROM songs INNER JOIN users ON songs.userid=users.id";
      if(req.query.genre && req.query.city) {
        query_string = query_string + " WHERE city=? AND songs.genre=?";
        var filters = [req.query.city, req.query.genre];
      }
      else if(req.query.genre) {
        query_string = query_string + " WHERE songs.genre=?";
        var filters = [req.query.genre];
      }
      else if(req.query.city) {
        query_string = query_string + " WHERE city=?";
        var filters = [req.query.city];
      }
      else {
        var filters = [];
      }
      filterQuery(query_string, filters);
    });

});

/**
 * Define the routes for displaying collaborators
 */
//show a table with all users that pass the filter
router.get('/collaborators', stormpath.getUser, function (req, res, next) {
    //show a table with all songs that pass the filter
    db.query(
        "SELECT * from users", function(err, rows1) {

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
                        res.render('collaborators', { entries: rows1,
                            query_entries: rows2,
                            default_genre: req.query.genre,
                            default_city: req.query.city,
                            unique_genres: genres.filter(getUnique),
                            unique_cities: cities.filter(getUnique)
                        });
                    });
            }

            var query_string =  "SELECT * from users";
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

router.get('/profiles/:id', stormpath.getUser, function (req, res, next) {
    //display the users id
    db.query(
        "SELECT * FROM users WHERE id = ?", [req.params.id], function(err, rows1) {
            db.query(
                "SELECT * FROM songs where userid = ?", [req.params.id],function(err,rows2){
                    if (err) {
                        res.json({
                            statusCode: 500,
                            message: "Failed to retrieve all user"+ err
                        });
                    }
                    res.render('collaborator', {
                        firstName: rows1[0].firstName,
                        lastName: rows1[0].lastName,
                        city: rows1[0].city,
                        genre: rows1[0].genre,
                        emailz: rows1[0].id,
                        query_entries: rows2
                    });
                });
        });
});

/**
 * When someone wants to add a collaborator
 */
router.post('/collaborators',stormpath.getUser, function(req, res){
    //update local user database (conversants and conversations)
    if (req.user.email!==req.body.email) {
        //see if such a conversation between these two alreadys exists
        db.query(
            "SELECT conversationID FROM conversants WHERE userID = ? OR userID = ?" +
            " GROUP BY conversationID HAVING COUNT(conversationID)>1;", [req.user.email, req.body.email], function (err,rows) {
                if (err) {
                    res.json({
                        statusCode: 500,
                        message: "Failed to add new collaboration" + err
                    });
                }
                else {
                    //chat between these two exists
                    if (rows.length > 0) {
                        res.redirect('back');
                    }
                    //chat between these two doesnt exist
                    else {
                        console.log('TRYING TO MAKE NEW CONVERSATION');
                        conversations.create_conversation(db,req,res);
                    }
                }
                //res.redirect('collaborator');
            });
    }
    //you tried to add yourself
    else{
        res.redirect('back');
    }
});

router.get('/music/:id', stormpath.getUser, function (req, res, next) {
  //play a song based on the randomly selected song
  db.query(
      "SELECT * FROM songs INNER JOIN users ON songs.userid=users.id WHERE songs.id = ?", [req.params.id], function(err, rows) {
        res.render('music', { url: JSON.stringify(rows[0].soundcloudurl), 
                              name: rows[0].songname,
                              artist: rows[0].firstName,
                              email: rows[0].userid
                            });
      });
});

module.exports = router;