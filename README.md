# Selfie Search

Look up your profile image by email.

Built on Node.js and Express.js.

## Running Locally

Make sure you have [Node.js](http://nodejs.org/) and the [Heroku Toolbelt](https://toolbelt.heroku.com/) installed.

```sh
$ git clone git@github.com:kortaggio/selfie-search.git # or clone your own fork
$ cd selfie-search
$ npm install
```

### Start the app:

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

