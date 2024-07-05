exports.addPlatformToRequest = (req, res, next) => {
    const socialUrl = req.body.socialUrl;

    if(socialUrl.includes('youtube.com') || socialUrl.includes('youtu.be')) {
        req.body.platform = 'youtube';
        console.log(`addPlatformToRequest.js add platform to ${req.platform}`);
    } else if (socialUrl.includes('instagram.com')) {
        req.body.platform = 'instagram';
        console.log(`addPlatformToRequest.js add platform to ${req.platform}`);
    // } else if (socialUrl.includes('facebook.com')) {
    //     req.body.platform = 'facebook';
    //     console.log(`addPlatformToRequest.js add platform to ${req.platform}`);
    } else {
        console.log('Unsupported platform');
        return res.status(400).send('Unsupported platform');
    }

    next();
};