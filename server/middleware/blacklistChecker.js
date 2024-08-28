const redisClient = require('../config/redisClient');
const logger = require('../config/logger');

const blacklistChecker = async (req, res, next) => {
  const ip = req.ip;
  const isBlacklisted = await redisClient.get(`blacklist:${ip}`);
  
  // Get and print TTL
  try {
    const ttl = await redisClient.ttl(`blacklist:${ip}`);
  } catch (err) {
    logger.error('Failed to get TTL:', err);
  }

  if (isBlacklisted) {
    logger.warn(`IP ${ip} is blacklisted for ${ttl} ms`);
    return res.status(403).send('You are temporarily blacklisted. Please try again later.');
  }
  next();
};

module.exports = blacklistChecker;