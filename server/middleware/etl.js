const { extractData } = require('../etl/extract');
const { transformData } = require('../etl/transform');
const { loadData } = require('../etl/load');
const redisClient = require('../config/redisClient');
const crypto = require('crypto');
const logger = require('../config/logger');

exports.etl = async (req, res, next) => {
    const socialUrl = req.body.socialUrl;
    const platform = req.body.platform;
    const userId = req.user.id;

    try {
        // 檢查 Redis cache
        const cachedContent = await redisClient.get(socialUrl);
        if (cachedContent) {
            logger.info(`Cache hit URL: ${socialUrl}`);
            const cachedSocialData = JSON.parse(cachedContent);
            
            // 新增 user 和 createdAt 屬性
            cachedSocialData.user = userId;
            cachedSocialData.createdAt = new Date().toISOString();
            
            // 生成隨機的 tempCacheId
            const tempCacheId = crypto.randomBytes(16).toString('hex');
            cachedSocialData.tempCacheId = tempCacheId;
            
            // 將新的資料存回 Redis，使用 tempCacheId 作為鍵
            await redisClient.set(tempCacheId, JSON.stringify(cachedSocialData), { EX: 3600 });
            logger.info(`Stored cached data with tempCacheId: ${tempCacheId}`);
            
            // 將 cachedSocialData 儲存在 req.body 中
            req.body.cachedSocialData = cachedSocialData;
            return next();
        }

        // 提取資料
        const extractedData = await extractData(socialUrl, platform);
        logger.info(`ETL extracted from ${socialUrl}`);
        
        // 轉換資料
        const transformedData = await transformData(socialUrl, platform, extractedData, userId);
        logger.info(`ETL transformed for userId: ${userId}`);

        // 加載資料
        const savedData = await loadData(transformedData);
        logger.info(`ETL loaded for socialUrl: ${socialUrl}`);

        // 將結果存儲在 req 對象中
        req.body.savedData = savedData;

        // 檢查資料存取頻率
        const accessCount = await redisClient.incr(`accessCount:${socialUrl}`);
        if (accessCount > 1) {
            // 更新 Redis cache，設置 1 小時的有效期
            const cacheData = { ...transformedData }; // 使用 transformedData
            delete cacheData.user;
            delete cacheData.createdAt;
            await redisClient.set(socialUrl, JSON.stringify(cacheData), { EX: 3600 });
            logger.info(`URL: ${socialUrl} has been cached ${accessCount} times`);
            logger.info(`Data has been cached`);
        }
        // 調用 next() 將控制權交給下一個中間件
        next();
    } catch (error) {
        logger.error('ETL process failed', error);
        res.status(500).send('ETL process failed');
    }
};
