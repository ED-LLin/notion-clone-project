const redisClient = require('../config/redisClient');
const logger = require('../config/logger');

const blacklistChecker = async (req, res, next) => {
  const ip = req.ip;
  const isBlacklisted = await redisClient.get(`blacklist:${ip}`);
  
  let ttl; // 定義 ttl 變數

  // Get and print TTL
  try {
    ttl = await redisClient.ttl(`blacklist:${ip}`);
  } catch (err) {
    logger.error('Failed to get TTL:', err);
    ttl = null; // 如果獲取失敗，將 ttl 設為 null
  }

  if (isBlacklisted) {
    logger.warn(`IP ${ip} has ${ttl !== null ? ttl : 'unknown'} seconds remaining on the blacklist`);
    return res.status(403).send('You are temporarily blacklisted. Please try again later.');
  }
  next();
};

module.exports = blacklistChecker;