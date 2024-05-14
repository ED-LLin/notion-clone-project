const express = require('express');
const router = express.Router();
const {isLoggedIn} = require('../middleware/checkAuth')
const dashboardController = require('../controllers/dashboardController');

// Dashboard Route
router.get('/dashboard',isLoggedIn ,dashboardController.dashboard);
router.get('/dashboard/add',isLoggedIn ,dashboardController.dashboardAddNote);
router.post('/dashboard/submit',isLoggedIn ,dashboardController.dashboardSubmitNote);
router.get('/dashboard/item/:id',isLoggedIn ,dashboardController.dashboardViewNote);
router.post('/dashboard/update/item/:id', isLoggedIn ,dashboardController.dashboardUpdateNote);
router.delete('/dashboard/delete/item/:id', isLoggedIn ,dashboardController.dashboardDeleteNote);


module.exports = router;
