var express = require('express');
var app = express();
var selfie = require('./middleware/selfie-search.js');

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

// Templates
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(request, response) {
  response.render('pages/index');
});

// TODO: This isn't technically REST, should be /api/v1/selfie/:email
app.use('/api/v1/selfie', function(request, response, next) {
  selfie.find_img(request.query.email, function(img_src) {
    request.img_src = img_src;
    next();
  });
});

app.get('/api/v1/selfie', function(request, response) {
  response.send({
    img_src : request.img_src,
    success : !!request.img_src
  });
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});


