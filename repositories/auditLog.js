const { AuditLog } = require('../models');

async function listAuditLogs({ entityType, entityId, actorId }, limit, offset) {
  const where = {};
  if (entityType) where.entity_type = entityType;
  if (entityId) where.entity_id = entityId;
  if (actorId) where.actor_id = actorId;

  const logs = await AuditLog.findAll({
    where,
    order: [['created_at', 'DESC']],
    limit,
    offset,
  });
  return logs.map((l) => l.get({ plain: true }));
}

module.exports = { listAuditLogs };
