require('dotenv').load();
var md5 = require('blueimp-md5').md5;
var https = require('https');
var pg = require('pg');
var connectionString = process.env.DATABASE_URL ||
  'postgres://postgres:postgres@localhost:5432/selfiesearch';

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
    
    // TODO: Port the server-side code to ES6 and use Promises
    //       instead of callbacks.

    // TODO: Fix the "callback hell".
    //       This should really be accessed either through separate endpoints
    //       or through a websocket to take full advantage of Node's concurrency.
    //       That way we can make async requests to each service and let them
    //       come back to the user asynchronously instead of waiting until the
    //       last one is done before returning.

    // Check if email exists in database first
    self.get_email(email, function(img_src) {
      if (!img_src) {

        // Try checking gravatar
        self.gravatar(email, function(gravatar) {
          img_src = gravatar;
          if (!img_src) {

            // Try checking fullcontact
            self.fullcontact(email, function(profile_img) {
              img_src = profile_img;
              if (!img_src) {
                callback(img_src);
              } else {
                self.cache_email(email, img_src, function() {
                  callback(img_src);
                });
              }
            }); // end fullcontact

            callback(img_src);
          } else {
            self.cache_email(email, img_src, function() {
              callback(img_src);
            });
          }
        }); // end gravatar

      } else {
        callback(img_src);
      }
    }); // end DB call
    
  },

  /**
    * Gets the Gravatar image of an email, if it exists
    *
    * @param {String}   email
    * @param {Function} callback
    */
  gravatar: function(email, callback) {
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
          callback(GRAVATAR_URL + hash + '?s=' + IMG_SIZE);
        } else {
          // Gravatar does not exist
          callback(null);
        }
      });

      response.on('error', function(err) {
        callback(undefined);
      });

    });
  },

  /**
    * 
    * The original plan was to scrape Facebook, G+, Twitter, etc. directly
    * but none of these websites offer public API access.
    */
  fullcontact: function(email, callback) {
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

          callback(result.photos[0].url);

        } else {
          // Profile not found
          callback(null);
        }        
      });

      response.on('error', function(err) {
        callback(undefined);
      });

    });
  },

  /**
    * Cache a given email and img pair into the database for later retrieval
    * @param {String}   email
    * @param {String}   img_src
    * @param {Function} callback
    */
  cache_email: function(email, img_src, callback) {
    // TODO: Change this to a connection pool instead of an individual query
    pg.connect(connectionString, function(err, client, done) {
      var query = client.query("INSERT INTO emails(address, img_src) VALUES($1, $2);",
        [email, img_src]);

      query.on('end', function() {
        client.end();
        callback();
      });

      if (err) {
        console.log(err);
        client.end();
        callback();
      }

    });
  },

  /**
    * Retrieve a cached image from the database given an email
    * @param {String}   email
    * @param {Function} callback
    */
  get_email: function(email, callback) {
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
        callback(result);
      });

      if (err) {
        console.log(err);
        client.end();
        callback();
      }

    });
  }
};
