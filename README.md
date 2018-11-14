# Generic Node JS API

## Requirements
- [Nodejs 8+](https://nodejs.org/en/)
- [My Sql](https://dev.mysql.com/downloads/mysql/)

## Create Database
- You can use the GUI tool MySQL Workbench to create a new database

## Configuration
- Edit configuration in `config/default.json` and
- Custom environment variables names in `config/custom-environment-variables.json`,
- for example it will read `version` from **API_VERSION** environment variable.

Following variables can be configured:
- `authExpiresIn` the JWT token expiry (e.g. 1h, 1d, 1w..)
- `authSecret` the secret to encode/decode JWT tokens
- `port` the port to which the app listens
- `log.level` the log level `debug` or `info`
- `version` the version of api
- `db.url` the url to the MySQL database

## Local Deployment

- Install dependencies `npm i`
- Run lint check `npm run lint`
- Start app `npm start`
- Run `npm run init-db` to created DB schema

## Heroku Install
 - run `heroku login`
 - run `heroku create <app-name>`
 - run `git push heroku master`
 - run `heroku addons:create cleardb:ignite` to crate a mySql db
 - run `heroku config | grep CLEARDB_DATABASE_URL` to get the url
