const youtubeService = require('../services/youtubeServices');
const instagramService = require('../services/instagramServices');
const facebookService = require('../services/facebookServices');
const logger = require('../config/logger');

exports.extractData = async (socialUrl, platform) => {
    let extractedData;

    if (platform === 'youtube') {
        extractedData = await youtubeService.fetchYouTubeData(socialUrl);
    } else if (platform === 'instagram') {
        extractedData = await instagramService.fetchInstagramData(socialUrl);
    } else if (platform === 'facebook') {
        extractedData = await facebookService.fetchFacebookData(socialUrl);
    }

    logger.info(`extract successfully`);
    return extractedData;
};