require('dotenv').config();

const IORedis = require('ioredis');
const logger = require('../utils/logger');

const connection = new IORedis(process.env.REDIS_URL, {
    maxRetriesPerRequest: null
});

connection.on('error', (err) => {
    logger.error('Redis (queue) connection error', {error: err.message});
});

module.exports = connection;