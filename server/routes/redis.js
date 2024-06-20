const express = require('express');
const router = express.Router();
const redis = require('redis');  // 引入 redis 模塊
const redisClient = require('../config/redisClient');

// 示例路由，設置和獲取 Redis 值
router.get('/set', async (req, res) => {
  try {
    await redisClient.set('key', 'value');
    res.send('Key set');
  } catch (err) {
    res.send('Error: ' + err);
  }
});

router.get('/get', async (req, res) => {
  try {
    const reply = await redisClient.get('key');
    res.send('Value: ' + reply);
  } catch (err) {
    res.send('Error: ' + err);
  }
});

module.exports = router;
