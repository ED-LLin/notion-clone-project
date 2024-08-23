const { default: mongoose } = require('mongoose');
const SocialData = require('../models/SocialData');
const User = require('../models/User');
const { loadData } = require('../etl/load');
const redisClient = require('../config/redisClient');

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
            res.status(302).redirect(`/fetch-content/saved-content/tempId:${tempCacheId}`);
        // load data from API savedData
        } else if (req.body.savedData && req.body.savedData._id) {
            res.status(302).redirect(`/fetch-content/saved-content/${req.body.savedData._id.toString()}`);
        } else {
            res.status(400).send('Invalid request data');
        }
    } catch (error) {
        console.error('Failed to load cache content to MongoDB', error);
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
 *         description: Content not found or no permission to access.
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
                    return res.status(404).send('Cache data does not exist or has expired');
                }
                socialContent = JSON.parse(socialContent);
            } catch (error) {
                console.error('Error retrieving cache data:', error);
                return res.status(500).send('Failed to fetch cache data');
            }
        } else {
            if (!mongoose.Types.ObjectId.isValid(socialContentId)) {
                return res.status(400).send('Invalid content ID format');
            }

            // const socialDataQuery = await SocialData.findOne({ _id: socialContentId, user: req.user.id }).lean();
            const socialData = await SocialData.findOne({ _id: socialContentId, user: req.user.id }).lean();
            if (!socialData) {
                return res.status(404).send('Content not found or no permission');
            }
            socialContent = socialData;
        }

        res.status(200).render('./fetch-content/view-content', {
            socialContentId,
            socialContent,
            layout: '../views/layouts/dashboard'
        });
    } catch (error) {
        console.error("Error viewing social content:", error);
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
 *         description: Successfully deleted content and redirected to the dashboard.
 *       400:
 *         description: Invalid content ID format.
 *       401:
 *         description: Unauthorized, user not logged in.
 *       403:
 *         description: No permission to delete this content.
 *       404:
 *         description: Content not found.
 *       500:
 *         description: Server error or database connection error.
 */
exports.deleteSocialContent = async (req, res) => {
    try {
        const socialContentId = req.params.id;

        // 檢查 socialContentId 是否為有效的 ObjectId
        if (!mongoose.Types.ObjectId.isValid(socialContentId)) {
            return res.status(400).send('Invalid content ID format');
        }

        // 檢查 req.user 是否存在
        if (!req.user || !req.user._id) {
            return res.status(401).send('Unauthorized');
        }

        const socialContent = await SocialData.findById(socialContentId);

        // 檢查是否找到內容
        if (!socialContent) {
            return res.status(404).send('Content not found');
        }

        // 檢查用戶是否有權限刪除內容
        if (socialContent.user.toString() !== req.user._id.toString()) {
            return res.status(403).send('No permission to delete this content');
        }

        const deleteResult = await SocialData.findByIdAndDelete(socialContentId);

        // 檢查刪除操作是否成功
        if (!deleteResult) {
            return res.status(500).send('Failed to delete content');
        }

        res.status(302).redirect('/dashboard');
    } catch (error) {
        console.error('delete socialContent error: ', error);

        // 檢查是否為資料庫連接錯誤
        if (error instanceof mongoose.Error) {
            return res.status(500).send('Database connection error');
        }

        res.status(500).send('Server Error');
    }
}