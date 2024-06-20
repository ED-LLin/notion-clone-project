const redisClient = require('../config/redisClient');

const blacklistChecker = async (req, res, next) => {
  const ip = req.ip;
  const isBlacklisted = await redisClient.get(`blacklist:${ip}`);
  if (isBlacklisted) {
    return res.status(403).send('You are temporarily blacklisted. Please try again later.');
  }
  next();
};

module.exports = blacklistChecker;