exports.create = function(db, req, res) {
    db.query(
        "INSERT INTO songs (soundcloudurl, songname, genre, releasedate, userid) VALUES (?,?,?,?,?)", 
        [req.body.soundCloudURL, 
         req.body.songName, 
         req.body.genre, 
         req.body.releaseDate,
         req.body.userID], function(err) {
            if (err) {
                res.json({
                    statusCode: 500,
                    message: "Failed to add a new song"
                })
            }
            res.redirect('/profile');
        });
};

exports.retrieve_all = function(db, req, res) {
  db.query(
      "SELECT * from songs", function(err, fields) {
          if (err) {
              res.json({
                  statusCode: 500,
                  message: "Failed to retrieve all songs"
              });
          }
          res.json({
              statusCode: 200,
              data: fields
          });
      });
};

exports.retrieve = function(db, req, res) {
  db.query(
      "SELECT * from songs WHERE id = ?", [req.params.id], function(err, rows) {
          if (err) {
              res.json({
                  statusCode: 500,
                  message: "Failed to retrieve this song"
              });
          }
          res.json({
              statusCode: 200,
              data: rows
          });
      });
};

exports.delete = function(db, req, res) {
  db.query(
      "DELETE FROM songs WHERE id = ?", [req.params.id], function(err) {
          if (err) {
              res.json({
                  statusCode: 500,
                  message: "Failed to delete song"
              });
          }
          res.redirect('/profile');
      });
};