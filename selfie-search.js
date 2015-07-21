var md5 = require('blueimp-md5').md5;
var http = require('http');

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

      // if undefined, do stuff.
      callback(img_src);
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
    GRAVATAR_URL = 'http://www.gravatar.com/avatar/';

    hash = md5(email);

    var request = http.get(GRAVATAR_URL + hash, function(response) {
      var buffer = "";
      response.on('data', function(chunk) {
        buffer += chunk;
      });

      response.on('end', function() {
        // TODO: Cache the image file
        callback(GRAVATAR_URL + hash);
      });

      response.on('error', function(err) {
        callback(undefined);
      });

    });
  }
};
