const SocialData = require('../models/SocialData');
const logger = require('../config/logger');

exports.loadData = async (transformedData) => {
    try {
        const socialData = new SocialData(transformedData);
        const savedData = await socialData.save(); 
        
        logger.info(`load.js have saved savedData to MongoDB`);
        return savedData;
    } catch (error) {
        
        logger.error('Error loading data', error);
        throw new Error('Failed to load data');
    }
};