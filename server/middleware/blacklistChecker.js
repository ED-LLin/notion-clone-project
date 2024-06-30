const redisClient = require('../config/redisClient');

const blacklistChecker = async (req, res, next) => {
  const ip = req.ip;
  const isBlacklisted = await redisClient.get(`blacklist:${ip}`);
  
  // Get and print TTL
  try {
    const ttl = await redisClient.ttl(`blacklist:${ip}`);
  } catch (err) {
    console.error('Failed to get TTL:', err);
  }

  if (isBlacklisted) {
    return res.status(403).send('You are temporarily blacklisted. Please try again later.');
  }
  next();
};

module.exports = blacklistChecker;