const logger = require('../utils/logger');

require('./auditWorker');
require('./notificationWorker');
require('./notificationChunkWorker');
require('./searchIndexWorker');
require('./activityWorker');

logger.info('Audit worker started, waiting for job...');
logger.info('Notification worker started, waiting for job...');
logger.info('Activity worker started, waiting for job...');

process.on('SIGTERM', async() => {
    logger.info('Audit worker shutting down');
    logger.info('Notification worker shutting down');
    process.exit(0);
});