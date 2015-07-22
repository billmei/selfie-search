var pg = require('pg');
var connectionString = process.env.DATABASE_URL ||
  'postgres://postgres:postgres@localhost:5432/selfiesearch';

var client = new pg.Client(connectionString);
client.connect();

var query = client.query('CREATE TABLE ' +
  'emails(' +
    'id SERIAL PRIMARY KEY, ' +
    'address VARCHAR(128) not null, ' +
    'img_src VARCHAR(255))');

query.on('end', function() {
  client.end();
});

