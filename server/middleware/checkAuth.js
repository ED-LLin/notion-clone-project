const logger = require('../config/logger');

exports.isLoggedIn = function (req, res, next) {
    if(req.user){
        next();
    } else {
        logger.warn(`Unauthorized access attempt from IP: ${req.ip}`);
        return res.status(401).send('Log in to view notes.');
    }
};