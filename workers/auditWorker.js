const { Worker } = require('bullmq');
const connection = require('../db/redisQueueConnection');
const { AUDIT_QUEUE_NAME } = require('../queues/auditQueue');
const AuditLog = require('../models/AuditLog');
const logger = require('../utils/logger');

const worker = new Worker(
    AUDIT_QUEUE_NAME,
    async(job) => {
        const {entityType, entityId, action, actorId, changes} = job.data;

        await AuditLog.create({
            entity_type: entityType,
            entity_id: entityId,
            action,
            actor_id: actorId,
            changes
        });
    },
    {
        connection,
        concurrency: 10
    }
);

worker.on('completed', (job)=> {
    logger.info(`Audit job ${job.id} completed`, {
        entityType: job.data.entityType,
        entityId: job.data.entityId,
        action: job.data.action,
    });
});

worker.on('failed', (job, err) => {
    logger.error(
        `Audit job ${job?.id} failed after ${job?.attemptsMade ?? '?'} attempt(s): ${err.message}`,
        {stack: err.stack, jobData: job?.data}
    );
});

module.exports = worker;