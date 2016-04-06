/**
 * Created by Neil on 2016-03-25.
 */
exports.retrieve_conversations = function(db, req, res) {
    db.query(
        //SELECT * FROM users WHERE id IN (SELECT userID FROM conversants WHERE conversationID IN (SELECT DISTINCT conversationID FROM conversants WHERE userID=?) AND userID!=?);
        "SELECT * FROM users JOIN (SELECT * FROM conversants WHERE conversationID IN " +
        "(SELECT DISTINCT conversationID FROM conversants WHERE userID=?) " +
        "AND userID!=?) AS T ON id=userID;", [req.user.email,req.user.email], function(err, fields) {
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
                    message: err
                });
            }
            else {
                var realID = results[1];
                var realIDJSON = (JSON.parse(JSON.stringify(realID[0])));
                var final_conversationID = (realIDJSON[Object.keys(realIDJSON)[0]]);
                db.query(
                    `INSERT INTO conversants VALUES (?,'${final_conversationID}');`
                    + `INSERT INTO conversants VALUES (?,'${final_conversationID}');`,
                    [req.user.email, req.body.email],
                    function (err) {
                        if (err) {
                            res.redirect('back');
                        }
                        else {
                            res.redirect('back');
                        }
                    });
            }
        });
};

exports.retrieve_messages = function(db, req, res) {
    db.query(
        "SELECT firstName,lastName,userID,messageid,conversationID,timeSent,content FROM users JOIN " +
        "(SELECT id as messageID,timesent,content,userID,conversationID FROM messages WHERE conversationID=?) " +
        "AS T ON users.id=userID;", [req.params.conversationID], function(err, fields) {
            if (err) {
                res.json({
                    statusCode: 500,
                    message: "Failed to retrieve messages in conversation"
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

exports.create_message = function(db, req, res) {
    db.query(
        "INSERT INTO messages (userID,conversationID,timeSent,content) VALUES(?,?,NOW(),?);",
        [req.user.email,
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
                    message: "New message added to conversation"
                });
            }
        });
};