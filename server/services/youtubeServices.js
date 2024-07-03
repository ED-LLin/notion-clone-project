const axios = require('axios');

// 獨立的函數用來獲取 YouTube 數據
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
        console.log(`YouTube data gotten ${JSON.stringify(response.data)}`);
        return response.data;

    } catch (error) {
        console.error('Error fetching YouTube data:', error);
        throw(error);
    }
};
