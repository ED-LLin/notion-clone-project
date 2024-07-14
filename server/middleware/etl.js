const { extractData } = require('../etl/extract');
const { transformData } = require('../etl/transform');
const { loadData } = require('../etl/load');
const redisClient = require('../config/redisClient');
const crypto = require('crypto');

exports.etl = async (req, res, next) => {
    const socialUrl = req.body.socialUrl;
    const platform = req.body.platform;
    const userId = req.user.id;

    try {
        // 檢查 Redis cache
        const cachedContent = await redisClient.get(socialUrl);
        if (cachedContent) {
            console.log(`Cache hit URL: ${socialUrl}`);
            const cachedSocialData = JSON.parse(cachedContent);
            // console.log(`從快取拿出來的資料 ${JSON.stringify(cachedContent, null, 2)}`);
            
            // 新增 user 和 createdAt 屬性
            cachedSocialData.user = userId;
            cachedSocialData.createdAt = new Date().toISOString();
            
            // 生成隨機的 tempCacheId
            const tempCacheId = crypto.randomBytes(16).toString('hex');
            cachedSocialData.tempCacheId = tempCacheId;
            
            // 將新的資料存回 Redis，使用 tempCacheId 作為鍵
            await redisClient.set(tempCacheId, JSON.stringify(cachedSocialData), { EX: 3600 });
            // console.log(`修改之後被加到快取的資料 ${JSON.stringify(cachedSocialData, null, 2)}`);

            // 將 cachedSocialData 儲存在 req.body 中
            req.body.cachedSocialData = cachedSocialData;
            return next();

        }

        // 提取資料
        const extractedData = await extractData(socialUrl, platform);
        console.log(`ETL extracted`);
        
        // 轉換資料
        const transformedData = await transformData(socialUrl, platform, extractedData, userId);
        console.log(`ETL transformed`);
        console.log(`Transformed data's user:`, transformedData.user);

        // 加載資料
        const savedData = await loadData(transformedData);
        console.log(`ETL loaded`);

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
            console.log(`URL: ${socialUrl} 已被存入快取 ${accessCount} 次`);
            console.log(`資料已被存入快取`);
        }
        // 調用 next() 將控制權交給下一個中間件
        next();
    } catch (error) {
        console.error('ETL process failed', error);
        res.status(500).send('ETL process failed');
    }
};
