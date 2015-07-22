var md5 = require('blueimp-md5').md5;
var https = require('https');
var pg = require('pg');

module.exports = {

  /**
    * Find someone's profile image given their email.
    *
    * @param  {String} email
    * @return {String} img_src
    */
  find_img: function(email, callback) {
    var img_src, gravatar;

    this.get_gravatar(email, function(result) {
      gravatar = result;

      img_src = gravatar;

      // if undefined, check other sites.
      callback(img_src);

      /*
      TODO: Sites to implement
      - Facebook
      - Google Plus
      - Twitter
      - LinkedIn
      - Google Search
      */
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
          // TODO: Cache the image file
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

  cache_img: function(img_src) {

  }
};
