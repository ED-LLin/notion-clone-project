const express = require('express');
const router = express.Router();
const {isLoggedIn} = require('../middleware/checkAuth')
const dashboardController = require('../controllers/dashboardController');

// Dashboard Route
router.get('/dashboard',isLoggedIn ,dashboardController.dashboard);
router.get('/dashboard/add',isLoggedIn ,dashboardController.dashboardAddNote);
router.post('/dashboard/notes',isLoggedIn ,dashboardController.dashboardSubmitNote);
router.get('/dashboard/notes/:id',isLoggedIn ,dashboardController.dashboardViewNote);
router.put('/dashboard/notes/:id', isLoggedIn ,dashboardController.dashboardUpdateNote);
router.delete('/dashboard/notes/:id', isLoggedIn ,dashboardController.dashboardDeleteNote);


module.exports = router;
