const {Queue} = require('bullmq');
const connection = require('../db/redisQueueConnection');

const NOTIFICATION_CHUNK_QUEUE_NAME = 'notification-chunks';

const notificationChunkQueue = new Queue(NOTIFICATION_CHUNK_QUEUE_NAME, {
    connection,
    defaultJobOptions: {
        attempts: 5,
        removeOnComplete: {
            age: 60*60,
            count: 1000
        },
        removeOnFail: {
            age: 7*24*60*60
        }
    }
});

module.exports = {notificationChunkQueue, NOTIFICATION_CHUNK_QUEUE_NAME};