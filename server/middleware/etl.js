const { extractData } = require('../etl/extract');
const { transformData } = require('../etl/transform');
const { loadData } = require('../etl/load');

exports.etl = async (req, res, next) => {
    const socialUrl = req.body.socialUrl;
    const platform = req.platform;
    
    try {
        // 提取資料
        const extractedData = await extractData(socialUrl, platform);
        console.log(`ETL extracted`);
        
        // 轉換資料
        const transformedData = await transformData(socialUrl, platform, extractedData);
        console.log(`ETL transformed`);

        // 加載資料
        const savedData = await loadData(transformedData);
        console.log(`ETL loaded`)

        // 將結果存儲在 req 對象中
        req.savedData = savedData;

        // 調用 next() 將控制權交給下一個中間件
        next();
    } catch (error) {
        console.error('ETL process failed', error);
        res.status(500).send('ETL process failed');
    }
};
