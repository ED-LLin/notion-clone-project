const express = require('express');
const router = express.Router();
const mainController = require('../controllers/mainController');

// GET homepage
router.get('/', mainController.homepage);
router.get('/privacy-policy', mainController.privacyPolicyPage);

module.exports = router;