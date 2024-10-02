const express = require('express');
const router = express.Router();
const {isLoggedIn} = require('../middleware/checkAuth')
const dashboardController = require('../controllers/dashboardController');
const { addAiTagForNote } = require('../middleware/aiTagging');
const logger = require('../config/logger');

// Dashboard Route
router.get('/',isLoggedIn ,dashboardController.dashboard);
router.get('/add',isLoggedIn, dashboardController.dashboardAddNote);
router.post('/notes',isLoggedIn, addAiTagForNote, dashboardController.dashboardSubmitNote);
router.get('/notes/:id',isLoggedIn, dashboardController.dashboardViewNote);
router.put('/notes/:id', isLoggedIn , addAiTagForNote, dashboardController.dashboardUpdateNote);
router.delete('/notes/:id', isLoggedIn ,dashboardController.dashboardDeleteNote);
router.get('/search', isLoggedIn ,dashboardController.dashboardSearch);
router.get('/tags/:tag', isLoggedIn, dashboardController.viewTag)


module.exports = router;