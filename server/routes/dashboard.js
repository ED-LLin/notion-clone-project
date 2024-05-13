const express = require('express');
const router = express.Router();
const {isLoggedIn} = require('../middleware/checkAuth')
const dashboardController = require('../controllers/dashboardController');

// Dashboard Route
router.get('/dashboard',isLoggedIn ,dashboardController.dashboard);
router.get('/dashboard/add',isLoggedIn ,dashboardController.dashboardAddNote);
router.post('/dashboard/submit',isLoggedIn ,dashboardController.dashboardSubmitNote);


module.exports = router;