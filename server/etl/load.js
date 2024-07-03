const SocialData = require('../models/SocialData');

exports.loadData = async (transformedData) => {
    try {
        const socialData = new SocialData(transformedData);
        const savedData = await socialData.save(); 
        return savedData; // 返回儲存的資料
    } catch (error) {
        console.error('Error loading data', error);
        throw new Error('Failed to load data'); // 拋出錯誤
    }
};