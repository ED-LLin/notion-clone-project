const redis = require('redis');

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

const redisClient = redis.createClient({
  url: redisUrl
});

redisClient.on('connect', function() {
  console.log('Connected to Redis');
});

redisClient.on('error', function(err) {
  console.log('Redis error: ' + err);
});

redisClient.connect().catch(console.error);

module.exports = redisClient;
