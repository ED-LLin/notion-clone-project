const express = require('express')
const router = express.Router();
const { isLoggedIn } = require('../middleware/checkAuth');
const { addPlatformToRequest } = require('../middleware/addPlatformToRequest'); // 確保正確導入
const { etl } = require('../middleware/etl');
const fetcherController = require('../controllers/fetcherController');


router.get('/', isLoggedIn, fetcherController.addSocialContentPage);
router.post('/submit-url', isLoggedIn, addPlatformToRequest, etl, fetcherController.showSubmittedContent);
router.get('/view-content', isLoggedIn, fetcherController.viewContent);


module.exports = router;