const express = require('express');
const router = express.Router();
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const logger = require('../config/logger');

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
        // 使用 googleID 查找現有的使用者
        let user = await User.findOne({ googleID: profile.id });

        if (user) {
            logger.info('User found:', user); 
            done(null, user);
        } else {
            user = await User.create(newUser);
            logger.info('New user created:', user); 
            done(null, user);
        }

    } catch (error) {
        if (error.code === 11000) {  // 捕捉重複鍵錯誤
            let user = await User.findOne({ googleID: profile.id });
            logger.warn('Duplicate key error, user found:', user); 
            done(null, user);
        } else {
            logger.error('Error during authentication:', error);
            done(error);
        }
    }

  }
));

// Google Login
/**
 * @swagger
 * /auth/google:
 *   get:
 *     summary: 使用 Google 登錄
 *     tags: [Auth]
 *     description: 重定向到 Google 登錄頁面。無法在 Swagger UI 中直接測試。
 *     responses:
 *       302:
 *         description: 重定向到 Google 登錄頁面
 */
router.get('/auth/google',
 passport.authenticate('google', { 
    scope: ['email', 'profile'] 
  }));

/**
 * @swagger
 * /google/callback:
 *   get:
 *     summary: Google 登錄回調
 *     tags: [Auth]
 *     responses:
 *       302:
 *         description: 認證成功後重定向到儀表板
 *       401:
 *         description: 認證失敗，重定向到登錄失敗頁面
 */
router.get('/google/callback', 
  passport.authenticate('google', { 
    failureRedirect: '/login-failure' }),
  function(req, res) {
    // Successful authentication, redirect dashboard.
    res.status(302).redirect('/dashboard');
  });

/**
 * @swagger
 * /login-failure:
 *   get:
 *     summary: 登錄失敗
 *     tags: [Auth]
 *     responses:
 *       401:
 *         description: 認證失敗
 */
router.get('/login-failure', (req, res) => {
    res.status(401).send('Authentication failed. Please try again.');
});

// Destroy session
/**
 * @swagger
 * /logout:
 *   post:
 *     summary: 用戶登出
 *     tags: [Auth]
 *     responses:
 *       302:
 *         description: 成功登出並重定向到首頁
 *       500:
 *         description: 登出過程中發生錯誤
 */
router.post('/logout', (req, res) => {
    req.session.destroy((error) => {
        if (error) {
            logger.error('Error during logout:', error);
            res.status(500).send('Error logging out');
        } else {
            logger.info('User logged out successfully');
            res.status(302).redirect('/');
        }
    });
});

// 序列化使用者（取得使用者資料）
passport.serializeUser((user, done) => {
    logger.info(`User serialized: ${user.id}`);
    done(null, user.id);
});

// 反序列化使用者（取得使用者資料）
passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
        if (err) {
            logger.error('Error during user deserialization:', err);
        }
        done(err, user);
    });
});

module.exports = router;