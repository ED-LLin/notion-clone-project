const express = require('express');
const router = express.Router();
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
},
async function(accessToken, refreshToken, profile, done) {  

    const newUser = {
        googleID: profile.id,
        displayName: profile.displayName,
        firstName: profile.name.givenName,
        lastName: profile.name.familyName,
        profileImage: profile.photos[0].value
    }

    try {
        let user = await User.findOne({ googleID: profile.id });

        if (user) {
            done(null, user);
        } else {
            user = await User.create(newUser);
            done(null, user);
        }

    } catch (error) {
        console.log(error);
        done(error);  // 確保在捕捉到錯誤時調用 done
    }

  }
));

// Google Login
router.get('/auth/google',
  passport.authenticate('google', { scope: ['email', 'profile'] }));

router.get('/google/callback', 
  passport.authenticate('google', { 
    failureRedirect: '/login-failure' }),
  function(req, res) {
    // Successful authentication, redirect dashboard.
    res.redirect('/dashboard');
  });

// Route if something goes wrong
router.get('/login-failure', (req, res) => {
    res.send('Something went wrong')
});

// Destroy session
router.get('/logout', (req, res) => {
    req.session.destroy((error) => {
        if (error) {
            console.log(error);
            res.send('Error logging out');
        } else {
            res.redirect('/');
        }
    });
});

// 序列化使用者（取得使用者資料）
passport.serializeUser((user, done) => {
    done(null, user.id);
});


// 反序列化使用者（取得使用者資料）
passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
        done(err, user);
    });
});

module.exports = router;

