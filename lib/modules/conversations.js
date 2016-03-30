/**
 * Created by Neil on 2016-03-25.
 */
exports.retrieve_conversations = function(db, req, res) {
    db.query(
        "SELECT * from conversations WHERE userID = ?", [req.params.userID], function(err, fields) {
            if (err) {
                res.json({
                    statusCode: 500,
                    message: "Failed to retrieve all conversations"
                });
            }
            else {
                res.json({
                    statusCode: 200,
                    data: fields
                });
            }
        });
};

exports.create_conversation = function(db, req, res) {
    db.query(
        "INSERT INTO conversations (timeInitiated) VALUES (NOW()); SELECT LAST_INSERT_ID();",
        function (err, results) {
            if (err) {
                res.json({
                    statusCode: 500,
                    message: "Failed to create a new conversation"
                })
            }
            else {
                var realID = results[1];
                var realIDJSON = (JSON.parse(JSON.stringify(realID[0])));
                var final_conversationID = (realIDJSON[Object.keys(realIDJSON)[0]]);
                db.query(
                    `INSERT INTO conversants VALUES (?,'${final_conversationID}');`
                    + `INSERT INTO conversants VALUES (?,'${final_conversationID}');`
                    + `INSERT INTO messages (userID,conversationID,timeSent,content) VALUES(?,'${final_conversationID}',NOW(),?);`,
                    [req.params.userID, req.body.recipient, req.params.userID, req.body.message],
                    function (err) {
                        if (err) {
                            res.json({
                                statusCode: 500,
                                message: "Failed to create a new conversation"
                            })
                        }
                        else {
                            res.json({
                                statusCode: 200,
                                message: "New conversation created"
                            });
                        }
                    });
            }
        });
};

exports.retrieve_messages = function(db, req, res) {
    db.query(
        "SELECT * FROM messages WHERE conversationID = ?", [req.params.conversationID], function(err, rows) {
            if (err) {
                res.json({
                    statusCode: 500,
                    message: "Failed to retrieve messages in conversation"
                });
            }
            else {
                res.json({
                    statusCode: 200,
                    data: rows
                });
            }
        });
};

exports.create_message = function(db, req, res) {
    db.query(
        "INSERT INTO messages (userID,conversationID,timeSent,content) VALUES(?,?,NOW(),?);",
        [req.params.userID,
            req.params.conversationID,
            req.body.message], function(err) {
            if (err) {
                res.json({
                    statusCode: 500,
                    message: "Failed to add a new message to conversation"
                })
            }
            else {
                res.json({
                    statusCode: 200,
                    message: "New song added to conversation"
                });
            }
        });
};