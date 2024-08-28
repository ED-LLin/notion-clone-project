const logger = require('../config/logger');

exports.addPlatformToRequest = (req, res, next) => {
    const socialUrl = req.body.socialUrl;

    if(socialUrl.includes('youtube.com') || socialUrl.includes('youtu.be')) {
        req.body.platform = 'youtube';
        logger.info(`User ${req.user.id} added platform to ${req.body.platform}`);
    } else if (socialUrl.includes('instagram.com')) {
        req.body.platform = 'instagram';
        logger.info(`User ${req.user.id} added platform to ${req.body.platform}`);
    // } else if (socialUrl.includes('facebook.com')) {
    //     req.body.platform = 'facebook';
    //     logger.info(`addPlatformToRequest.js add platform to ${req.platform}`);
    } else {
        logger.warn(`User ${req.user.id} attempted to submit unsupported platform contebt`);
        return res.status(400).send('Unsupported platform');
    }

    next();
};