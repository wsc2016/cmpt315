Collaborama is user based website for artists to login and interact online with one another. Users personalize their user profiles, and help build an online community among artists.

1. install dependencies \n
$npm install \n

2. set up envirnment variables with stormpath \n
$export STORMPATH_CLIENT_APIKEY_ID=1SPLWQ9L8L1GKR948TPY1X3Z8 \n
$ export STORMPATH_CLIENT_APIKEY_SECRET=UEoVoGQaPT+YLL/164E83ixOk8H9bu3F62BSRhtr208 \n
$ export STORMPATH_APPLICATION_HREF=https://api.stormpath.com/v1/applications/2Qtoa6BUkRCCOJawhnITwE

4.Create the database and tables\n
CREATE DATABASE collaborama \n
USE collaborama \n

CREATE TABLE callouts(
  `id` INT NOT NULL AUTO_INCREMENT,
  `userid` INT NULL,
  `message` VARCHAR(256) NULL,
  `city` VARCHAR(45) NULL,
  `genre` VARCHAR(45) NULL,
 `created` DATETIME NULL,
  PRIMARY KEY (`id`)); \n



3. run server locally \n
$node server.js
