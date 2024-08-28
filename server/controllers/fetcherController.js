const { default: mongoose } = require('mongoose');
const SocialData = require('../models/SocialData');
const User = require('../models/User');
const { loadData } = require('../etl/load');
const redisClient = require('../config/redisClient');
const logger = require('../config/logger');

/**
 * @swagger
 * /social-content/submit:
 *   post:
 *     summary: Submit social content URL
 *     tags: [Fetch Social Content] 
 *     description: Submit social content, supporting data retrieval from cache or API.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cachedSocialData:
 *                 type: object
 *                 properties:
 *                   tempCacheId:
 *                     type: string
 *               savedData:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *     responses:
 *       302:
 *         description: Successfully redirected to the saved content.
 *       400:
 *         description: Invalid request data.
 *       500:
 *         description: Internal server error.
 */
exports.socialContentSubmit = async(req, res) => {
    try {
        // load data from cache
        if (req.body.cachedSocialData && req.body.cachedSocialData.tempCacheId) {
            const tempCacheId = req.body.cachedSocialData.tempCacheId;
            await loadData(req.body.cachedSocialData);
            logger.info(`User ${req.user.id} accessed cached social content with tempCacheId: ${tempCacheId}`);
            res.status(302).redirect(`/fetch-content/saved-content/tempId:${tempCacheId}`);
        // load data from API savedData
        } else if (req.body.savedData && req.body.savedData._id) {
            const savedDataId = req.body.savedData._id.toString();
            logger.info(`User ${req.user.id} accessed social content with ID: ${savedDataId}`);
            res.status(302).redirect(`/fetch-content/saved-content/${savedDataId}`);
        } else {
            logger.warn(`User ${req.user.id} submitted invalid request data`);
            res.status(400).send('Invalid request data');
        }
    } catch (error) {
        logger.error(`User ${req.user.id} failed to load social content to MongoDB`, error); // 修改為 social content
        res.status(500).send('Internal Server Error');
    }
};

/**
 * @swagger
 * /social-content/{id}:
 *   get:
 *     summary: View social content
 *     tags: [Fetch Social Content] 
 *     description: Retrieve social content based on content ID, supporting retrieval from cache or database.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The unique identifier of the social content.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved and rendered social content.
 *       400:
 *         description: Invalid content ID format.
 *       404:
 *         description: Social content not found or no permission to access.
 *       500:
 *         description: Server error.
 */
exports.viewSocialContent = async(req, res) => {
    try {
        let socialContent;
        const socialContentId = req.params.id;

        if (socialContentId.includes("tempId:")) {
            const tempId = socialContentId.split("tempId:")[1];
            // Get data from Cache
            try {
                socialContent = await redisClient.get(tempId);
                if (!socialContent) {
                    logger.warn(`User ${req.user.id} attempted to access non-existent or expired social content with tempId: ${tempId}.`);
                    return res.status(404).send('Cache data does not exist or has expired');
                }
                socialContent = JSON.parse(socialContent);
            } catch (error) {
                logger.error(`User ${req.user.id} encountered an error retrieving social content:`, error);
                return res.status(500).send('Failed to fetch cache data');
            }
        } else {
            if (!mongoose.Types.ObjectId.isValid(socialContentId)) {
                logger.warn(`User ${req.user.id} provided an invalid social content ID: ${socialContentId}`);
                return res.status(400).send('Invalid content ID format');
            }

            const socialData = await SocialData.findOne({ _id: socialContentId, user: req.user.id }).lean();
            if (!socialData) {
                logger.warn(`User ${req.user.id} attempted to access social content with ID: ${socialContentId}, but it was not found or they had no permission`);
                return res.status(404).send('Social content not found or no permission');
            }
            socialContent = socialData;
        }

        logger.info(`User ${req.user.id} successfully viewed social content with ID: ${socialContentId}`);
        res.status(200).render('./fetch-content/view-content', {
            socialContentId,
            socialContent,
            layout: '../views/layouts/dashboard'
        });
    } catch (error) {
        logger.error(`User ${req.user.id} encountered an error viewing social content:`, error);
        res.status(500).send("Server error");
    }
}

/**
 * @swagger
 * /social-content/{id}:
 *   delete:
 *     summary: Delete social content
 *     tags: [Fetch Social Content] 
 *     description: Delete social content by content ID, owner operation only.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The unique identifier of the social content.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully deleted social content and redirected to the dashboard.
 *       400:
 *         description: Invalid content ID format.
 *       401:
 *         description: Unauthorized, user not logged in.
 *       403:
 *         description: No permission to delete this social content.
 *       404:
 *         description: Social content not found.
 *       500:
 *         description: Server error or database connection error.
 */
exports.deleteSocialContent = async (req, res) => {
    try {
        const socialContentId = req.params.id;

        // 檢查 socialContentId 是否為有效的 ObjectId
        if (!mongoose.Types.ObjectId.isValid(socialContentId)) {
            logger.warn(`User ${req.user.id} tried to delete with invalid social content ID: ${socialContentId}`);
            return res.status(400).send('Invalid content ID format');
        }

        // 檢查 req.user 是否存在
        if (!req.user || !req.user._id) {
            logger.warn(`Unauthorized access attempt by user: ${req.user.id}`);
            return res.status(401).send('Unauthorized');
        }

        const socialContent = await SocialData.findById(socialContentId);

        // 檢查是否找到內容
        if (!socialContent) {
            logger.warn(`User ${req.user.id} attempted to delete social content with ID: ${socialContentId}, but it was not found`);
            return res.status(404).send('Social content not found');
        }

        // 檢查用戶是否有權限刪除內容
        if (socialContent.user.toString() !== req.user._id.toString()) {
            logger.warn(`User ${req.user.id} attempted to delete social content with ID: ${socialContentId}, but has no permission`);
            return res.status(403).send('No permission to delete this social content');
        }

        const deleteResult = await SocialData.findByIdAndDelete(socialContentId);

        // 檢查刪除操作是否成功
        if (!deleteResult) {
            logger.error(`User ${req.user.id} failed to delete social content with ID: ${socialContentId}`);
            return res.status(500).send('Failed to delete social content');
        }

        logger.info(`User ${req.user.id} successfully deleted social content with ID: ${socialContentId}`);
        res.status(302).redirect('/dashboard');
    } catch (error) {
        logger.error(`User ${req.user.id} encountered an error while deleting social content:`, error);
        // 檢查是否為資料庫連接錯誤
        if (error instanceof mongoose.Error) {
            return res.status(500).send('Database connection error');
        }

        res.status(500).send('Server Error');
    }
}