const redisClient = require('../config/redisClient');

const blacklistChecker = async (req, res, next) => {
  const ip = req.ip;
  console.log(`Request IP: ${ip}`); // Print IP address
  const isBlacklisted = await redisClient.get(`blacklist:${ip}`);
  console.log(`Blacklist status for IP ${ip}: ${isBlacklisted}`); // Print blacklist status

  // Get and print TTL
  try {
    const ttl = await redisClient.ttl(`blacklist:${ip}`);
    console.log(`TTL for blacklist:${ip} is ${ttl} seconds.`);
  } catch (err) {
    console.error('Failed to get TTL:', err);
  }

  if (isBlacklisted) {
    return res.status(403).send('You are temporarily blacklisted. Please try again later.');
  }
  next();
};

module.exports = blacklistChecker;