const youtubeService = require('../services/youtubeServices');
const instagramService = require('../services/instagramServices');
const facebookService = require('../services/facebookServices');
// const fs = require('fs');
// const path = require('path');

exports.extractData = async (socialUrl, platform) => {
    let extractedData;

    if (platform === 'youtube') {
        extractedData = await youtubeService.fetchYouTubeData(socialUrl);
    } else if (platform === 'instagram') {
        extractedData = await instagramService.fetchInstagramData(socialUrl);
    } else if (platform === 'facebook') {
        extractedData = await facebookService.fetchFacebookData(socialUrl);
    }

    // const filePath = path.join(__dirname, '../../fetchedSampleData', `${platform}-data.json`);
    // fs.writeFileSync(filePath, JSON.stringify(extractedData, null, 2));

    console.log(`extract successfully`);
    return extractedData;
};