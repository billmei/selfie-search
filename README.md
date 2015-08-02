# Selfie Search

Find the profile image associated with an email address.

**DEMO: [http://selfie-search.herokuapp.com/](http://selfie-search.herokuapp.com/)**

Built on Node.js, Express.js, and Postgres.

## Architecture

[![](http://i.imgur.com/oH1KY2b.png)](https://docs.google.com/drawings/d/1WOe29v3Ka4zwd5yDdRu7bBWAjWM1eoS1wPpJVAo4YSE)

Profile images are searched first through Gravatar, then after through FullContact. The original plan was to scrape Facebook, G+, Twitter, etc. directly but none of these websites offer public API access.

Results are cached in Postgres to speed up future calls on the same email.

## Running Locally

Make sure you have [Node.js](http://nodejs.org/) installed.

```sh
$ git clone git@github.com:kortaggio/selfie-search.git # or your own fork
$ cd selfie-search
$ npm install
```

## Database Configuration

Install postgres:

```sh
$ sudo aptitude install postgresql postgresql-contrib
```

Configure postgres:

```sh
$ su
$ useradd <yourusername>
$ passwd <yourpassword>
```

Open `/etc/pstgresql/9.3/main/pg_hba.conf` as root and change the line

	local   postgres    all    peer

to

	local   all         all    peer

Reload postgres

```sh
$ sudo /etc/init.d/postgresql reload
```

Create the user in postgres:

```sh
$ su - postgres
$ psql
```

```
postgres=# CREATE USER <yourusername>;
postgres=# CREATE DATABASE selfiesearch;
postgres=# \connect selfiesearch;
selfiesearch=# GRANT ALL privileges ON DATABASE selfiesearch TO <yourusername>;
```

Set up the tables:

```sh
$ node models/create.js
```

To open a connection to the database, use:

```sh
$ psql -d selfiesearch
```

## Third party APIs

This app requires an API key from [FullContact](https://www.fullcontact.com/). Sign up for an account to get a key, then create an `.env` file in the root folder and save your key:

	FULLCONTACT_API_KEY=<your-api-key-here>


## Run

```sh
$ npm start
```

Your app should now be running on [localhost:5000](http://localhost:5000/).

