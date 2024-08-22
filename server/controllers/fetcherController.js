const { default: mongoose } = require('mongoose');
const SocialData = require('../models/SocialData');
const User = require('../models/User');
const { loadData } = require('../etl/load');
const redisClient = require('../config/redisClient');

/**
 * @swagger
 * /social-content:
 *   get:
 *     summary: 獲取用戶的社交內容
 *     tags: [Fetch Social Content]
 *     description: 根據用戶 ID 獲取社交內容並渲染表單。
 *     responses:
 *       200:
 *         description: 成功獲取社群媒體內容，返回社群表單。
 *       400:
 *         description: 用戶 ID 格式無效。
 *       404:
 *         description: 找不到用戶。
 *       403:
 *         description: 用戶 ID 不匹配。
 *       500:
 *         description: 內部伺服器錯誤。
 */
exports.socialContentForm = async(req, res) => {
    try {
        const userId = req.user._id;

        // Validate userId as a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).send('Invalid user ID format');
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).send('User not found in database');
        }

        // Confirm user._id matches req.user._id
        if (user._id.toString() !== userId.toString()) {
            return res.status(403).send('User ID does not match');
        }

        const socialData = await SocialData.aggregate([
            { $match: { user: new mongoose.Types.ObjectId(userId) } },
            { $sort: { createdAt: -1 } }
        ]);

        res.status(200).render('fetch-content/social-content', {
            layout: '../views/layouts/dashboard',
            user,
            socialData
        });
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error");
    }
};

/**
 * @swagger
 * /social-content/submit:
 *   post:
 *     summary: 提交社交內容 URL
 *     tags: [Fetch Social Content] 
 *     description: 提交社交內容，支持從快取或 API 獲取數據。
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
 *         description: 成功重定向到保存的內容。
 *       400:
 *         description: 請求數據無效。
 *       500:
 *         description: 內部伺服器錯誤。
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
 *     summary: 查看社交內容
 *     tags: [Fetch Social Content] 
 *     description: 根據內容 ID 獲取社交內容，支持從快取或資料庫中檢索。
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: 社交內容的唯一標識符。
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 成功獲取社交內容並渲染。
 *       400:
 *         description: 內容 ID 格式無效。
 *       404:
 *         description: 找不到內容或無權限訪問。
 *       500:
 *         description: 伺服器錯誤。
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
 *     summary: 刪除社交內容
 *     tags: [Fetch Social Content] 
 *     description: 根據內容 ID 刪除社交內容，僅限擁有者操作。
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: 社交內容的唯一標識符。
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 成功刪除內容並重定向到儀表板。
 *       400:
 *         description: 內容 ID 格式無效。
 *       401:
 *         description: 未授權，使用者未登入。
 *       403:
 *         description: 無權限刪除該內容。
 *       404:
 *         description: 找不到內容。
 *       500:
 *         description: 伺服器錯誤或資料庫連接錯誤。
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