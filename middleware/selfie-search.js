var md5 = require('blueimp-md5').md5;
var https = require('https');
var pg = require('pg');
var connectionString = process.env.DATABASE_URL ||
  'postgres://postgres:postgres@localhost:5432/selfiesearch';

module.exports = {

  /**
    * Find someone's profile image given their email.
    *
    * @param  {String} email
    * @return {String} img_src
    */
  find_img: function(email, callback) {
    var img_src;
    var self = this;
    
    // Check if email exists in database first
    self.get_email(email, function(img_src) {
      if (!img_src) {

        // Try checking gravatar
        self.get_gravatar(email, function(gravatar) {
          img_src = gravatar;

          if (!img_src) {
            /*
            TODO: Check other sites
            - Facebook
            - Google Plus
            - Twitter
            - LinkedIn
            - Google Search
            */
            callback(img_src);
          } else {
            self.cache_email(email, img_src, function() {
              callback(img_src);
            });
          }

        });

      } else {
        callback(img_src);
      }
    });
    
  },

  /**
    * Returns the Gravatar image of an email, if it exists
    *
    * @param  {String} email
    * @return {String} img_src
    */
  get_gravatar: function(email, callback) {
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
          callback(GRAVATAR_URL + hash);
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
    * Cache a given email and img pair into the database for later retrieval
    */
  cache_email: function(email, img_src, callback) {
    pg.connect(connectionString, function(err, client, done) {
      // TODO: Prevent SQL injection
      client.query("INSERT INTO emails(address, img_src) values($1, $2);",
        [email, img_src]);

      var query = client.query("SELECT * FROM emails;");

      query.on('end', function() {
        client.end();
        callback();
      });

      if (err) {
        console.log(err);
      }
    });
  },

  /**
    * Retrieve a cached image from the database given an email
    */
  get_email: function(email, callback) {
    var result;

    pg.connect(connectionString, function(err, client, done) {
      // TODO: Prevent SQL injection
      var query = client.query("SELECT img_src FROM emails WHERE address = '" +
        email + "';");

      query.on('row', function(row) {
        result = row.img_src;
      });

      query.on('end', function() {
        client.end();
        callback(result);
      });

      if (err) {
        console.log(err);
      }

    });
  }
};
