const {Queue} = require('bullmq');
const connection = require('../db/redisQueueConnection');

const AUDIT_QUEUE_NAME = 'audit-log';

const auditQueue = new Queue(AUDIT_QUEUE_NAME, {
    connection,
    defaultJobOptions : {
        attempts: 5,
        backoff: {
            type: 'exponential',
            delay: 1000
        },
        removeOnComplete: {
            age: 60*60,
            count: 1000
        },
        removeOnFail: {
            age: 7*24*60*60
        }
    }
});

module.exports = { auditQueue, AUDIT_QUEUE_NAME};