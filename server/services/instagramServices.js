const axios = require('axios');

// 獨立的函數用來獲取 Instagram 數據
exports.fetchInstagramData = async (socialUrl) => {
    const options = {
        method: 'GET',
        url: 'https://instagram-scraper-api2.p.rapidapi.com/v1/post_info',
        params: {
            code_or_id_or_url: socialUrl,
            include_insights: 'true'
        },
        headers: {
            'x-rapidapi-key': process.env.x_rapidapi_key,
            'x-rapidapi-host': 'instagram-scraper-api2.p.rapidapi.com'
        }
    };

    try {
        const response = await axios.request(options);
        console.log(`response IG data gotten`);
        return response.data

    } catch (error) {
        console.error('Error fetching Instagram data:', error);
        throw error;
    }
};
