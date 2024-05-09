const express = require('express');
const router = express.Router();
const mainController = require('../controllers/mainController');

// GET homepage
router.get('/', mainController.homepage);

module.exports = router;