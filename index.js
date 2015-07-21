var pg = require('pg');
var express = require('express');
var app = express();
var selfie = require('./selfie-search.js');

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(request, response) {
  response.render('pages/index');
});

app.use('/api/img_from_email', function(request, response, next) {
  selfie.find_img(request.query.email, function(img_src) {
    request.img_src = img_src;
    next();
  });
});

app.get('/api/img_from_email', function(request, response) {
  response.send(request.img_src);
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});


