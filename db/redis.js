require('dotenv').config();

const Redis = require('ioredis');
const logger = require('../utils/logger');

const redis = new Redis(process.env.REDIS_URL);

redis.on('error', (err) => {
  logger.error('Redis connection error', { error: err.message });
});

module.exports = redis;