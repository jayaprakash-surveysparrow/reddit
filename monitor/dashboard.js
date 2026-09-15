const { createBullBoard } = require('@bull-board/api');
const { BullMQAdapter } = require('@bull-board/api/bullMQAdapter');
const { ExpressAdapter } = require('@bull-board/express');
const { Queue } = require('bullmq');

const connection = require('../db/redisQueueConnection');
const auditLogQueue = new Queue('audit-log', { connection });
const notificationQueue = new Queue('notification-queue', { connection });
const notificationChunksQueue = new Queue('notification-chunks', { connection });

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/admin/queues');

createBullBoard({
  queues: [
    new BullMQAdapter(auditLogQueue),
    new BullMQAdapter(notificationQueue),
    new BullMQAdapter(notificationChunksQueue),
  ],
  serverAdapter,
});

const express = require('express');
const app = express();
app.use('/admin/queues', serverAdapter.getRouter());
app.listen(3001, () => console.log('Bull Board on http://localhost:3001/admin/queues'));