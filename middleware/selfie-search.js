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
  find_img: function(email, callback) {
    var img_src;
    var self = this;

    Q
      .try(self.get_email(email))
      .catch(function(email) {
        img_src = self.gravatar(email);
      })
      .catch(function(email) {
        img_src = self.fullcontact(email);
      })
      .catch(function(email) {
        img_src = undefined;
      })
      .done(function(email) {
        if (img_src) {
          self.cache_email(email);
          callback(img_src);
        } else {
          callback(undefined);
        }
      });    
  },

  /**
    * Retrieve a cached image from the database given an email
    * @param {String} email
    */
  get_email: function(email) {
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


        console.log("found email in database, img_src is: " + result);


        deferred.resolve(result);
      });

      if (err) {


        console.log("could not find email in database. Error is: " + err);


        client.end();
        deferred.reject(new Error("Error reading from database."));
      }
    });

    return deferred.promise;
  },

  /**
    * Gets the Gravatar image of an email, if it exists
    *
    * @param {String} email
    */
  gravatar: function(email) {
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


          deferred.reject(new Error("A Gravatar could not be found for that email."));
        }
      });

      response.on('error', function(err) {


        console.log("Could not reach gravatar. Error is: " + err);


        deferred.reject(new Error("Error reaching Gravatar, their website may be down."));
      });

      return deferred.promise;
    });
  },

  /**
    * Gets a profile image using the FullContact API.
    *
    * The original plan was to scrape Facebook, G+, Twitter, etc. directly
    * but none of these websites offer public API access.
    *
    * @param {String} email
    */
  fullcontact: function(email) {
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
        if (response.statusCode >= 200 && response.statusCode < 400) {
          var result = JSON.parse(buffer);


          console.log("Found email in fullcontact, URL is: " + result.photos[0].url);


          deferred.resolve(result.photos[0].url);

        } else {


          console.log("Could not find email in fullcontact.");


          deferred.reject(new Error("Could not find a profile image associated with that email address."));
        }        
      });

      response.on('error', function(err) {


        console.log("Could not reach fullcontact. Error is: " + err);


        deferred.reject(new Error("Error reaching FullContact, their website may be down."));
      });

      return deferred.promise;
    });
  },

  /**
    * Cache a given email and img pair into the database for later retrieval
    * @param {String} email
    * @param {String} img_src
    */
  cache_email: function(email, img_src) {
    var deferred = Q.defer();


    console.log("Caching result in database. Email is: " + email + " and img_src is: " + img_src);


    // TODO: Change this to a connection pool instead of an individual query
    pg.connect(connectionString, function(err, client, done) {
      var query = client.query("INSERT INTO emails(address, img_src) VALUES($1, $2);",
        [email, img_src]);

      query.on('end', function() {
        client.end();


        console.log("Finished caching result in database.");


        deferred.resolve();
      });

      if (err) {
        client.end();


        console.log("Could not write to database. Error is: " + err);


        deferred.reject(new Error("Error writing to database."));
      }

      return deferred.promise;
    });
  },

};
