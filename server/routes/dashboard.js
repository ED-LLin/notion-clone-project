const express = require('express');
const router = express.Router();
const {isLoggedIn} = require('../middleware/checkAuth')
const dashboardController = require('../controllers/dashboardController');

// Dashboard Route
router.get('/',isLoggedIn ,dashboardController.dashboard);
router.get('/add',isLoggedIn ,dashboardController.dashboardAddNote);
router.post('/notes',isLoggedIn ,dashboardController.dashboardSubmitNote);
router.get('/notes/:id',isLoggedIn ,dashboardController.dashboardViewNote);
router.put('/notes/:id', isLoggedIn ,dashboardController.dashboardUpdateNote);
router.delete('/notes/:id', isLoggedIn ,dashboardController.dashboardDeleteNote);
router.get('/search', isLoggedIn ,dashboardController.dashboardSearch);


module.exports = router;