require('dotenv').load();
var md5 = require('blueimp-md5').md5;
var https = require('https');
var pg = require('pg');
var connectionString = process.env.DATABASE_URL ||
  'postgres://postgres:postgres@localhost:5432/selfiesearch';

var Q = require('q');
var IMG_SIZE = 310;

module.exports = {


  /**
    * Find someone's profile image given their email.
    *
    * @param {String}   email
    * @param {Function} callback
    */
  findImg: function(email, callback) {
    var imgSRC;
    var needsCache = false;
    var self = this;

    self.getFromDB(email)
      .catch(function() {
        needsCache = true;
        return self.getGravatar(email);
      })
      .catch(function() {
        needsCache = true;
        return self.getFullContact(email);
      })
      .catch(function() {
        needsCache = false;
        return Q.Promise(function(resolve){return resolve(null);});
      })
      .then(function(imgSRC) {
        console.log("needsCache is: " + needsCache);
        if (needsCache) {
          return self.cacheEmail(email, imgSRC);
        }
        return Q.Promise(function(resolve){return resolve(imgSRC);});
      })
      .done(function(imgSRC) {
        console.log("Calling back now.");
        callback(imgSRC);
      });
  },

  /**
    * Retrieve a cached image from the database given an email
    * @param {String} email
    */
  getFromDB: function(email) {
    var deferred = Q.defer();


    console.log("searching database with email: " + email);

    
    var result;
    // TODO: Change this to a connection pool instead of an individual query
    pg.connect(connectionString, function(err, client, done) {
      var query = client.query("SELECT img_src FROM emails WHERE address=$1;",
        [email]);

      query.on('row', function(row) {
        result = row.img_src;
      });

      query.on('end', function() {
        client.end();

        if (result) {


          console.log("found email in database, imgSRC is: " + result);


          deferred.resolve(result);
        } else {
          

          console.log("Didn't find email in database");


          deferred.reject("Could not find email in database.");
        }

      });

      if (err) {

        console.log("could not find email in database. Error is: " + err);


        client.end();
        deferred.reject("Error reading from database.");
      }
    });

    return deferred.promise;
  },

  /**
    * Gets the Gravatar image of an email, if it exists
    *
    * @param {String} email
    */
  getGravatar: function(email) {
    var deferred = Q.defer();
    var hash, GRAVATAR_URL;


    console.log("searching gravatar with email: " + email);


    GRAVATAR_URL = 'https://www.gravatar.com/avatar/';
    hash = md5(email);

    var request = https.get(GRAVATAR_URL + hash + '?d=404', function(response) {
      var buffer = "";
      response.on('data', function(chunk) {
        buffer += chunk;
      });

      response.on('end', function() {
        if (response.statusCode >= 200 && response.statusCode < 400) {


          console.log("found gravatar, URL is: " + GRAVATAR_URL + hash + '?s=' + IMG_SIZE);


          deferred.resolve(GRAVATAR_URL + hash + '?s=' + IMG_SIZE);
        } else {


          console.log("Could not find gravatar.");


          deferred.reject("A Gravatar could not be found for that email.");
        }
      });

      response.on('error', function(err) {


        console.log("Could not reach gravatar. Error is: " + err);


        deferred.reject("Error reaching Gravatar, their website may be down.");
      });
    });

    return deferred.promise;
  },

  /**
    * Gets a profile image using the FullContact API.
    *
    * The original plan was to scrape Facebook, G+, Twitter, etc. directly
    * but none of these websites offer public API access.
    *
    * @param {String} email
    */
  getFullContact: function(email) {
    var deferred = Q.defer();
    var FULLCONTACT_URL = 'https://api.fullcontact.com/v2/person.json';


    console.log("searching fullcontact with email: " + email);


    var request = https.get(FULLCONTACT_URL +
      '?email=' + email +
      '&apiKey=' + process.env.FULLCONTACT_API_KEY, function(response) {

      var buffer = "";
      response.on('data', function(chunk) {
        buffer += chunk;
      });

      response.on('end', function() {
        if (response.statusCode >= 200 &&
            response.statusCode <  400 &&
            response.statusCode !== 202) {
          var result = JSON.parse(buffer);


          console.log(result);
          console.log("Found email in fullcontact, URL is: " + result.photos[0].url);


          deferred.resolve(result.photos[0].url);

        } else {
          deferred.reject("Could not find a profile image associated with that email address.");
        }        
      });

      response.on('error', function(err) {


        console.log("Could not reach fullcontact. Error is: " + err);


        deferred.reject("Error reaching FullContact, their website may be down.");
      });
    });

    return deferred.promise;
  },

  /**
    * Cache a given email and img pair into the database for later retrieval
    * @param {String} email
    * @param {String} imgSRC
    */
  cacheEmail: function(email, imgSRC) {
    var deferred = Q.defer();

    console.log("Caching result in database. Email is: " + email + " and imgSRC is: " + imgSRC);

    if (!imgSRC) {
      deferred.reject("No imgSRC provided. When trying to cache.");
    } else {
      // TODO: Change this to a connection pool instead of an individual query
      pg.connect(connectionString, function(err, client, done) {
        var query = client.query("INSERT INTO emails(address, img_src) VALUES($1, $2);",
          [email, imgSRC], function(error, result) {

          });

        query.on('end', function() {
          client.end();

          console.log("DB caching completed.");

          deferred.resolve(imgSRC);
        });

        if (err) {
          client.end();
          deferred.reject("Error writing to database.");
        }
      });
    }

    return deferred.promise;
  },

};
