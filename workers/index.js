const logger = require('../utils/logger');

require('./auditWorker');

logger.info('Audit worker started, waiting for job...');

process.on('SIGTERM', async() => {
    logger.info('Audit worker shutting down');
    process.exit(0);
});