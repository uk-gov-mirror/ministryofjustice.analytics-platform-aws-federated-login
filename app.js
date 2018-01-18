require('dotenv').config();

const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const nunjucks = require('nunjucks');
const passport = require('passport');
const session = require('express-session');
const { join } = require('path');
const Auth0Strategy = require('passport-auth0-openidconnect').Strategy;
const routes = require('./routes/index');

const app = express();


// Passport setup
const strategy = new Auth0Strategy(
  {
    domain: process.env.AUTH0_DOMAIN,
    clientID: process.env.AUTH0_CLIENT_ID,
    clientSecret: process.env.AUTH0_CLIENT_SECRET,
    callbackURL: process.env.AUTH0_CALLBACK_URL ||
                 'http://localhost:3000/callback',
    scope: 'openid profile email',
    passReqToCallback: true,
  },
  ((
    req, issuer, audience, profile, accessToken,
    refreshToken, params, callback,
  ) => {
    req.session.id_token = params.id_token;
    return callback(null, profile._json);
  }),
);
passport.use(strategy);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

// Nunjucks setup
nunjucks.configure(join(__dirname, 'templates'), {
  autoescape: true,
  express: app,
});
app.set('view engine', 'nunjucks');

app.use(cookieParser());
app.use(session({
  secret: process.env.COOKIE_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 30 * 60 * 1000 }, // 30 minutes
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(favicon(`${__dirname}/public/favicon.ico`));
app.use(logger('dev'));
app.use(express.static(path.join(__dirname, 'public')));


// Routes setup
app.use('/', routes);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use((err, req, res) => {
    res.status(err.status || 500);
    res.render('error.html', {
      message: err.message,
      error: err,
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use((err, req, res) => {
  res.status(err.status || 500);
  res.render('error.html', {
    message: err.message,
    error: {},
  });
});


module.exports = app;
