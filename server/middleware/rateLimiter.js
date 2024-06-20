const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis').default;
const redisClient = require('../config/redisClient');

const limiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args) => redisClient.sendCommand(args),
  }),
  windowMs: 10 * 1000, // 10 秒
  max: 3, // 每 10 秒最多 3 次請求
  handler: (req, res) => {
    const ip = req.ip;
    redisClient.set(`blacklist:${ip}`, '1', 'EX', 10 * 60); // 鎖 10 分鐘
    res.status(429).send('Too many requests, please try again later.');
  },
});

module.exports = limiter;