'use strict';

const bodyParser = require('body-parser');
const client = require('./client');
const cookieParser = require('cookie-parser');
const config = require('./config');
const db = require('./db');
const express = require('express');
const session = require('express-session');
const fs = require('fs');
const https = require('https');
const oauth2 = require('./oauth2');
const passport = require('passport');
const path = require('path');
const site = require('./site');
const token = require('./token');
const user = require('./user');
const mongoose = require('mongoose');
const connectMongo = require('connect-mongo');
// const cors = require('cors');

// console.log('Using MemoryStore for the data store');
// console.log('Using MemoryStore for the Session');
// const MemoryStore = expressSession.MemoryStore;
mongoose.Promise = Promise;
mongoose.connect('mongodb://localhost:27017/oauthdb');
mongoose.connection.on('error', () => {
  console.log('%s MongoDB connection error. Please make sure MongoDB is running.', chalk.red('✗'));
  process.exit();
});

const MongoStore = connectMongo(session);

// Express configuration
const app = express();

// app.use(cors({
//   "origin": "http://localhost:4000", //浏览器端的credentials=include时，此处不能为*，必须是一个具体的域名
//   "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
//   "preflightContinue": false,
//   "optionsSuccessStatus": 204,
//   credentials: true  //浏览器端的credentials=include时，此值必须设置为true
// }));


app.set('view engine', 'ejs');
app.use(cookieParser());

// Session Configuration
app.use(session({
  saveUninitialized: true,
  resave: true,
  secret: config.session.secret,
  store: new MongoStore({
    url: 'mongodb://localhost:27017/oauthdb',
    autoReconnect: true,
  }),
  key: 'authorization.sid',
  cookie: { maxAge: config.session.maxAge },
}));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(passport.initialize());
app.use(passport.session());

// Passport configuration
require('./passport');

app.get('/', site.index);
app.get('/login', site.loginForm);
app.post('/login', site.login);
app.get('/logout', site.logout);
app.get('/account', site.account);

app.get('/dialog/authorize', oauth2.authorization);
app.post('/dialog/authorize/decision', oauth2.decision);
app.post('/oauth/token', oauth2.token);

app.get('/api/userinfo', user.info);
app.get('/api/clientinfo', client.info);
app.post('/api/register', user.register);

// Mimicking google's token info endpoint from
// https://developers.google.com/accounts/docs/OAuth2UserAgent#validatetoken
app.get('/api/tokeninfo', token.info);

// Mimicking google's token revoke endpoint from
// https://developers.google.com/identity/protocols/OAuth2WebServer
app.get('/api/revoke', token.revoke);

// static resources for stylesheets, images, javascript files
app.use(express.static(path.join(__dirname, 'public')));

// Catch all for error messages.  Instead of a stack
// trace, this will log the json of the error message
// to the browser and pass along the status with it
app.use((err, req, res, next) => {
  if (err) {
    if (err.status == null) {
      console.error('Internal unexpected error from:', err.stack);
      res.status(500);
      res.json(err);
    } else {
      res.status(err.status);
      res.json(err);
    }
  } else {
    next();
  }
});

// From time to time we need to clean up any expired tokens
// in the database
setInterval(() => {
  db.accessTokens.removeExpired()
    .catch(err => console.error('Error trying to remove expired tokens:', err.stack));
}, config.db.timeToCheckExpiredTokens * 1000);

// TODO: Change these for your own certificates.  This was generated through the commands:
// openssl genrsa -out privatekey.pem 2048
// openssl req -new -key privatekey.pem -out certrequest.csr
// openssl x509 -req -in certrequest.csr -signkey privatekey.pem -out certificate.pem
const options = {
  key: fs.readFileSync(path.join(__dirname, 'certs/privatekey.pem')),
  cert: fs.readFileSync(path.join(__dirname, 'certs/certificate.pem')),
};

// Create our HTTPS server listening on port 3000.
https.createServer(options, app).listen(3000);
console.log('OAuth 2.0 Authorization Server started on port 3000');
