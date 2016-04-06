exports.create = function(db, req, res) {
    //add user.city, user.genre, current date when tables are migrated together
    db.query(
        "INSERT INTO callouts (message, userid, city, genre, name) VALUES (?, ?, ?, ?, ?)", [req.body.message, req.body.userid, req.body.city, req.body.genre, req.body.fullName], function(err) {
            if (err) {
                res.json({
                    statusCode: 500,
                    message: "Failed to create a new callout"
                })
            }

        });
    res.redirect('/');
};

exports.retrieve = function(db, req, res) {
  db.query(
      callouts = "SELECT * from callouts", function(err, rows) {
          if (err) {
              res.json({
                  statusCode: 500,
                  message: "Failed to retrieve all callouts"
              });
          }
          res.render('callouts', {
            statusCode: 200,
            data: rows
          });
      });
};

// //develope specific retrieve statments for user.genre and user.city once database merges
exports.retrieve = function(db, req, res) {
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


          res.render('callout',{
            statusCode:200,
            messages: JSON.stringify(messages),
            own: owner,
          });
      });
};



exports.delete = function(db, req, res) {
  db.query(
      "DELETE FROM callouts WHERE id = ?", [req.params.id], function(err) {
          if (err) {
              res.json({
                  statusCode: 500,
                  message: "Failed to delete callout"
              });
          }
          res.json({
              statusCode: 200,
              message: "Callout deleted"
          });
      });
};

exports.update = function(db, req, res) {
  db.query(
      "UPDATE callouts SET message = ? WHERE id = ?", [req.body.message, req.params.id], function(err) {
          if (err) {
              res.json({
                  statusCode: 500,
                  message: "Failed to update message record"
              });
          }
          res.json({
              statusCode: 200,
              message: "Message updated"
          });
      });
};