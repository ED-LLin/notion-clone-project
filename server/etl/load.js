const SocialData = require('../models/SocialData');

exports.loadData = async (transformedData) => {
    try {
        const socialData = new SocialData(transformedData);
        const savedData = await socialData.save(); 
        console.log(`load.js haved saved savedData to MongoDB`);
        return savedData; // 返回儲存的資料
    } catch (error) {
        console.error('Error loading data', error);
        throw new Error('Failed to load data'); // 拋出錯誤
    }
};