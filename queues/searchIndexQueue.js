const { Queue } = require('bullmq');
const connection = require('../db/redisQueueConnection');

const SEARCH_INDEX_QUEUE_NAME = 'search-index-queue';

const searchIndexQueue = new Queue(SEARCH_INDEX_QUEUE_NAME, {
  connection,
  defaultJobOptions: {
    attempts: 5,
    backoff: { type: 'exponential', delay: 1000 },
    removeOnComplete: { age: 60 * 60, count: 1000 },
    removeOnFail: { age: 7 * 24 * 60 * 60 },
  },
});

module.exports = { searchIndexQueue, SEARCH_INDEX_QUEUE_NAME };