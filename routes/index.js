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

router.get('/login', (req, res) => {
  res.render('login.html', {
    AUTH0_DOMAIN: process.env.AUTH0_DOMAIN,
    AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID,
    AUTH0_CALLBACK_URL: process.env.AUTH0_CALLBACK_URL ||
                        'http://localhost:3000/callback',
  });
});

router.get(
  '/callback',
  passport.authenticate('auth0-oidc', { failureRedirect: '/login' }),
  (req, res) => {
    res.redirect(req.session.returnTo || '/');
  },
);

module.exports = router;
