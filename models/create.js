var pg = require('pg');
var connectionString = process.env.DATABASE_URL ||
  'postgres://postgres:postgres@localhost:5432/selfiesearch';

var client = new pg.Client(connectionString);
client.connect();

var query = client.query('CREATE TABLE ' +
  'emails(' +
    'id SERIAL PRIMARY KEY, ' +
    'address VARCHAR(128) NOT NULL UNIQUE, ' +
    'img_src VARCHAR(255));' +
  'CREATE INDEX address_index ON emails (address)');

query.on('end', function() {
  client.end();
});

