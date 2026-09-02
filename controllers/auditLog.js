const logger = require('../utils/logger');
const { parsePagination } = require('../utils/pagination');
const { listAuditLogs } = require('../repositories/auditLog');

async function getAuditLogs(req, res) {
  try {
    const { limit, offset, page } = parsePagination(req.query);
    const { entityType, entityId, actorId } = req.query;

    const logs = await listAuditLogs({ entityType, entityId, actorId }, limit, offset);
    res.status(200).json({ logs, page, limit });
  } catch (err) {
    logger.error(err.message, { stack: err.stack });
    res.status(500).json({ error: 'Something went wrong' });
  }
}

module.exports = { getAuditLogs };
