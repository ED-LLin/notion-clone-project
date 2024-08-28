const axios = require('axios');
const logger = require('../config/logger');

exports.fetchYouTubeData = async (socialUrl) => {
    const videoId = socialUrl.split('v=')[1] || socialUrl.split('/').pop().split('?')[0];
    const options = {
        method: 'GET',
        url: 'https://yt-api.p.rapidapi.com/dl',
        params: { id: videoId },
        headers: {
            'x-rapidapi-key': process.env.x_rapidapi_key,
            'x-rapidapi-host': 'yt-api.p.rapidapi.com'
        }
    };

    try {
        const response = await axios.request(options);
        logger.info(`YouTube data gotten`);
        return response.data;

    } catch (error) {
        logger.error('Error fetching YouTube data:', error);
        throw error;
    }
};
