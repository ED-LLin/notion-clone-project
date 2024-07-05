const axios = require('axios');

exports.fetchFacebookData = async (socialUrl) => {
    const options = {
        method: 'GET',
        url: 'https://axesso-facebook-data-service.p.rapidapi.com/fba/facebook-post-details',
        params: {
            url: socialUrl
        },
        headers: {
            'x-rapidapi-key': process.env.x_rapidapi_key,
            'x-rapidapi-host': 'axesso-facebook-data-service.p.rapidapi.com'
        }
    };

    try {
        const response = await axios.request(options);
        console.log(`response FB data: ${JSON.stringify(response.data, null, 2)}`);
        return response.data;
        
    } catch (error) {
        console.error(error);
        throw error;
    }
};