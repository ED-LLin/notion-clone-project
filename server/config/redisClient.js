const redis = require('redis');
const logger = require('./logger');

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

const redisClient = redis.createClient({
  url: redisUrl
});

redisClient.on('connect', function() {
  logger.info('Connected to Redis');
});

redisClient.on('error', function(err) {
  logger.error('Redis error: ' + err);
});

redisClient.connect().catch(console.error);

module.exports = redisClient;
