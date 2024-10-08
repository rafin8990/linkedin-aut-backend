const express = require('express');
const passport = require('passport');
const LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;
const session = require('express-session');
require('dotenv').config();

const app = express();

// Setup express session
app.use(
  session({
    secret: process.env.LINKEDIN_CLIENT_SECRET, 
    resave: false,
    saveUninitialized: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());


passport.use(
  new LinkedInStrategy(
    {
      clientID: process.env.LINKEDIN_CLIENT_ID,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
      callbackURL: 'http://localhost:3000/auth/linkedin/callback',
      scope: ['openid','profile'], 
      state: true,
    },
    function (accessToken, refreshToken, profile, done) {
      done(null, profile);
    }
  )
);


passport.serializeUser((user, done) => {
  done(null, user);
});


passport.deserializeUser((user, done) => {
  done(null, user);
});


app.get('/auth/linkedin', passport.authenticate('linkedin', { state: 'SOME_STATE' }));


app.get(
  '/auth/linkedin/callback',
  passport.authenticate('linkedin', {
    successRedirect: '/profile',
    failureRedirect: '/',
  })
);


app.get('/profile', (req, res) => {
  if (!req.isAuthenticated()) {
    res.redirect('/');
  } else {
    res.send(`<h1>Hello ${req.user.displayName}</h1><a href="/logout">Logout</a>`);
  }
});


app.get('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect('/');
  });
});


app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
