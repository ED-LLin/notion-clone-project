const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis').default;
const redisClient = require('../config/redisClient');

const limiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args) => redisClient.sendCommand(args),
  }),
  windowMs: 10 * 1000, // 10 秒
  max: 3, // 每 10 秒最多 3 次請求
  handler: async (req, res) => {
    const ip = req.ip;
    try {
      await redisClient.set(`blacklist:${ip}`, '1', { EX: 10 }); // 鎖 10 秒鐘
      console.log(`IP ${ip} has been blacklisted for 10 seconds.`);
    } catch (err) {
      console.error('Failed to set blacklist:', err);
    }
    res.status(429).send('Too many requests, please try again later.');
  },
});

module.exports = limiter;