const express = require('express');

const router = express.Router();
const passport = require('passport');
const { ensureLoggedIn } = require('connect-ensure-login');
const uuidv4 = require('uuid/v4');
const AWSFederatedLogin = require('../aws-federation');
const { URL } = require('url');

router.get('/', ensureLoggedIn('/login'), (req, res) => {
  const aws = new AWSFederatedLogin({
    aws_account_id: process.env.AWS_ACCOUNT_ID,
    login_url: `https://${process.env.AUTH0_DOMAIN}/login`,
    role_name: `${process.env.ENV}_user_${req.user.nickname}`,
    session_name: req.user.nickname,
    jwt: req.session.id_token,
  });

  const destination = new URL(
    req.query.destination || '/console/home?region=eu-west-1',
    'https://console.aws.amazon.com',
  );

  aws.console_url(destination).then((url) => {
    res.redirect(url);
  });
});

router.get('/login', (req, res, next) => {
  if (req.isAuthenticated()) {
    if (/^http/.test(req.session.returnTo)) {
      res.send(400, 'URL must be relative');
    } else {
      res.redirect(req.session.returnTo);
    }
  } else {
    passport.authenticate('auth0-oidc', {
      prompt: req.query.prompt || 'none',
      state: uuidv4(),
    })(req, res, next);
  }
});

router.get(
  '/callback',
  passport.authenticate('auth0-oidc', { failureRedirect: '/login?prompt=true' }),
  (req, res) => {
    res.redirect(req.session.returnTo || '/');
  },
);

router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

router.get('/healthz', (req, res) => {
  res.status(200).send("😬👍");
});

module.exports = router;
