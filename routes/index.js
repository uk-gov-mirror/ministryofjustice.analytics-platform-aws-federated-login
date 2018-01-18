const express = require('express');

const router = express.Router();
const passport = require('passport');
const { ensureLoggedIn } = require('connect-ensure-login');
const AWSFederatedLogin = require('../aws-federation');

router.get('/', ensureLoggedIn('/login'), (req, res) => {
  const aws = new AWSFederatedLogin({
    aws_account_id: process.env.AWS_ACCOUNT_ID,
    login_url: `https://${process.env.AUTH0_DOMAIN}/login`,
    role_name: `${process.env.PLATFORM_ENV}_user_${req.user.nickname}`,
    session_name: req.user.nickname,
    jwt: req.session.id_token,
  });

  const console_url = 'https://eu-west-1.console.aws.amazon.com/console/home?region=eu-west-1';
  aws.console_url(console_url).then((url) => {
    res.redirect(url);
  });
});

router.get('/login', (req, res, next) => {
  if (req.isAuthenticated()) {
    if (/^http/.test(req.session.returnTo)) {
      return res.send(400, "URL must be relative");
    }
    res.redirect(req.session.returnTo);
  } else {
    passport.authenticate('auth0-oidc', {
      state: req.session.returnTo,
    })(req, res, next);
  }

});

router.get(
  '/callback',
  passport.authenticate('auth0-oidc', { failureRedirect: '/login' }),
  (req, res) => {
    res.redirect(req.query.state || '/');
  },
);

router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

module.exports = router;
