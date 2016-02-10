"use strict";

let passport = require('koa-passport');
let pg = require('./pgsql.js');

let isDev = (process.env.NODE_ENV === 'development');

let root =  isDev ? 'http://localhost:8080/' : 'http://www.pseudoq.net/' ;

console.log("auth callback root : "+root);

passport.serializeUser(function(user, done) {
  //console.log('serialize : '+JSON.stringify(user));
  done(null, user.userId)
});

passport.deserializeUser(function(id, done) {
  let user = pg.users[id];
  //console.log('deserialize : ' + id + ', user : ' +JSON.stringify(user));
  done(null, user);
});

var LocalStrategy = require('passport-local').Strategy;
passport.use(new LocalStrategy(function(username, password, done) {
  // retrieve user ...
  if (username === 'test' && password === 'test') {
    done(null, user);
  } else {
    done(null, false);
  }
}));

var FacebookStrategy = require('passport-facebook').Strategy;
passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_ID,
    clientSecret: process.env.FACEBOOK_SECRET,
    callbackURL: root + 'auth/facebook'
  },
  function(token, tokenSecret, profile, done) {
    console.log('facebook callback hot called');
    done(null, profile.id);
  }
));

if (!isDev) {

    let gh_ID = process.env.GITHUB_CLIENT_ID;
    if (gh_ID) {
      var GitHubStrategy = require('passport-github').Strategy;
      passport.use(new GitHubStrategy({
        clientID: gh_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: root + 'auth/github'
      },
      function(accessToken, refreshToken, profile, done) {
      done(null, profile.id);
      }
      ));
    }

    let twKey =  process.env.TWITTER_ID;
    if (twKey) {
      var TwitterStrategy = require('passport-twitter').Strategy;
      passport.use(new TwitterStrategy({
      consumerKey: twKey,
      consumerSecret: process.env.TWITTER_SECRET,
      callbackURL: root + 'auth/twitter'
      },
      function(token, tokenSecret, profile, done) {
      done(null, profile.id);
      }
      ));
    }

    let goog_Id = process.env.GOOGLE_ID;
    if (goog_Id) {
      var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
      passport.use(new GoogleStrategy({
        clientID: goog_Id,
        clientSecret: process.env.GOOGLE_SECRET,
        callbackURL: root + 'auth/google'
      },
      function(accessToken, refreshToken, profile, done) {
      done(null, profile.id);
      }
      ));
    }

}

module.exports = passport;