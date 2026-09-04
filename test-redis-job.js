const { randomUUID } = require('bullmq');
const {auditQueue} = require('./queues/auditQueue');

auditQueue.add('audit-event', {
    entityType: 'Post',
    entityId: randomUUID(),
    action: 'create',
    actorId: 'd31b9242-456f-4f50-8e18-3e3659d758dc',
    changes: {
        title: 'hello'
    }
}).then((job) => {
    console.log('added job', job.id);
    process.exit(0);
});