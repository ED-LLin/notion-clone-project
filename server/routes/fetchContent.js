const express = require('express')
const router = express.Router();
const { isLoggedIn } = require('../middleware/checkAuth');
const { addPlatformToRequest } = require('../middleware/addPlatformToRequest'); // 確保正確導入
const { etl } = require('../middleware/etl');
const fetcherController = require('../controllers/fetcherController');


router.get('/', isLoggedIn, fetcherController.socialContentForm);
router.post('/submit-url', isLoggedIn, addPlatformToRequest, etl, fetcherController.socialContentSubmit);
router.get('/saved-content/:id', isLoggedIn, fetcherController.viewSocialContent);
router.post('/auto-tagging/:id', isLoggedIn, fetcherController.autoTagging);

module.exports = router;