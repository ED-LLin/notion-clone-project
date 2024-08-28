const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis').default;
const redisClient = require('../config/redisClient');
const logger = require('../config/logger');

const limiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args) => redisClient.sendCommand(args),
  }),
  windowMs: 10 * 1000, 
  max: 50, 
  handler: async (req, res) => {
    const ip = req.ip;
    try {
      await redisClient.set(`blacklist:${ip}`, '1', { EX: 10 });
      logger.warn(`IP ${ip} has been blacklisted for 10 seconds.`);
    } catch (err) {
      logger.error('Failed to set blacklist:', err);
    }
    logger.info(`Too many requests from IP ${ip}`);
    res.status(429).send('Too many requests, please try again later.');
  },
});

module.exports = limiter;