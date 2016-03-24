exports.create = function(db, req, res) {
    //add user.city, user.genre, current date when tables are migrated together
    console.log(req.body.userid);
    db.query(
        "INSERT INTO callouts (userid, message) VALUES (?, ?)", [req.body.userid, req.body.message], function(err) {
            if (err) {
                res.json({
                    statusCode: 500,
                    message: "Failed to create a new callout"
                })
            }
            res.json({
                statusCode: 200,
                message: "New callout is added"
            });
        });
};

exports.retrieve = function(db, req, res) {
  db.query(
      "SELECT * from callouts", function(err, rows) {
          if (err) {
              res.json({
                  statusCode: 500,
                  message: "Failed to retrieve all callouts"
              });
          }
          res.json({
              statusCode: 200,
              data: rows
          });
      });
};

//develope specific retrieve statments for user.genre and user.city once database merges
exports.retrieve = function(db, req, res) {
  db.query(
      "SELECT * from callouts WHERE id = ?", [req.params.id], function(err, rows) {
          if (err) {
              res.json({
                  statusCode: 500,
                  message: "Failed to retrieve all callout"
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