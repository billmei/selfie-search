require('dotenv').load();
var md5 = require('blueimp-md5').md5;
var https = require('https');
var pg = require('pg');
var connectionString = process.env.DATABASE_URL ||
  'postgres://postgres:postgres@localhost:5432/selfiesearch';

var Q = require('qtree');

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

    // https://www.npmjs.com/package/q
    // https://github.com/kriskowal/q
    // https://github.com/Redsandro/qtree
    // https://github.com/kriskowal/q/issues/308

    Q
      .fcall(self.get_email(email))
      .then(self.gravatar)
      .then(self.fullcontact)
    
  },

  /**
    * Gets the Gravatar image of an email, if it exists
    *
    * @param {String} email
    */
  gravatar: function(email) {
    return Q.promise(function(resolve, reject, notify) {
      var hash, GRAVATAR_URL;

      GRAVATAR_URL = 'https://www.gravatar.com/avatar/';

      hash = md5(email);

      var request = https.get(GRAVATAR_URL + hash + '?d=404', function(response) {
        var buffer = "";
        response.on('data', function(chunk) {
          buffer += chunk;
        });

        response.on('end', function() {
          if (response.statusCode >= 200 && response.statusCode < 400) {
            resolve(GRAVATAR_URL + hash + '?s=' + IMG_SIZE);
          } else {
            reject(new Error("A Gravatar could not be found for that email."));
          }
        });

        response.on('error', function(err) {
          reject(new Error("Error reaching Gravatar, their website may be down."));
        });

      });
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
    return Q.Promise(function(resolve, reject, notify) {
      var FULLCONTACT_URL = 'https://api.fullcontact.com/v2/person.json';

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

            resolve(result.photos[0].url);

          } else {
            reject(new Error("Could not find a profile image associated with that email address."));
          }        
        });

        response.on('error', function(err) {
          reject(new Error("Error reaching FullContact, their website may be down."));
        });

      });
    });
  },

  /**
    * Cache a given email and img pair into the database for later retrieval
    * @param {String} email
    * @param {String} img_src
    */
  cache_email: function(email, img_src) {
    return Q.Promise(function(resolve, reject, notify) {
      // TODO: Change this to a connection pool instead of an individual query
      pg.connect(connectionString, function(err, client, done) {
        var query = client.query("INSERT INTO emails(address, img_src) VALUES($1, $2);",
          [email, img_src]);

        query.on('end', function() {
          client.end();
          resolve();
        });

        if (err) {
          console.log(err);
          client.end();
          reject(new Error("Error writing to database."));
        }

      });
    });
  },

  /**
    * Retrieve a cached image from the database given an email
    * @param {String} email
    */
  get_email: function(email) {
    return Q.Promise(function(resolve, reject, notify) {
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
          resolve(result);
        });

        if (err) {
          console.log(err);
          client.end();
          reject(new Error("Error reading from database."));
        }

      });
    });
    
  }
};
