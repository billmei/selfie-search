# Selfie Search

Look up your profile image by email.

Built on Node.js, Express.js, and Postgres.

## Running Locally

Make sure you have [Node.js](http://nodejs.org/) and the [Heroku Toolbelt](https://toolbelt.heroku.com/) installed.

```sh
$ git clone git@github.com:kortaggio/selfie-search.git # or clone your own fork
$ cd selfie-search
$ npm install
```

## Configure postgres

In bash:

```sh
su
useradd <yourusername>
passwd <yourpassword>
```

Open `/etc/pstgresql/9.3/main/pg_hba.conf` as root and change the line

	local   postgres    all    peer

to

	local   all         all    peer

Reload postgres

	sudo /etc/init.d/postgresql reload


Create the user in postgres:

```sh
su - postgres
psql
```

```
postgres=# CREATE USER <yourusername>;
postgres=# CREATE DATABASE selfiesearch;
postgres=# \connect selfiesearch;
selfiesearch=# GRANT ALL privileges ON DATABASE selfiesearch TO <yourusername>;
```

Set up the tables:

```sh
node models/create.js
```



To open a connection to the database, use:

	psql -d selfiesearch



## Start the app:

```sh
$ npm start
```

or if you have the Heroku Toolbelt installed:

```sh
$ foreman start web
```

Your app should now be running on [localhost:5000](http://localhost:5000/).

## Deploying to Heroku

```
$ heroku create
$ git push heroku master
$ heroku open
```

