const { getCurrentActorId } = require('./auditContext');
const {auditQueue} = require('../queues/auditQueue');
const logger = require('../utils/logger');

const AUDITED_MODELS = new Set(['User', 'Community', 'CommunityMember', 'Post', 'Comment', 'PostVote', 'CommentVote']);

const SENSITIVE_FIELDS = ['password_hash'];

function redactSnapshot(values) {
  const clone = { ...values };
  for (const field of SENSITIVE_FIELDS) {
    if (field in clone) clone[field] = '[redacted]';
  }
  return clone;
}

function redactDiff(diff) {
  const clone = {};
  for (const [field, change] of Object.entries(diff)) {
    clone[field] = SENSITIVE_FIELDS.includes(field) ? { old: '[redacted]', new: '[redacted]' } : change;
  }
  return clone;
}

function resolveActorId(entityType, instanceId) {
  const actorId = getCurrentActorId();
  if (actorId) return actorId;
  return entityType === 'User' ? instanceId : null;
}


function enqueueAuditJob(payload, transaction) {
  const enqueue = () => {
    auditQueue.add('audit-event', payload).catch((err) => {
      logger.error(
        `Failed to enqueue audit job for ${payload.entityType} ${payload.entityId}: ${err.message}`,
        {stack: err.stack, payload}
      );
    });
  };

  if(transaction){
    transaction.afterCommit(enqueue);
  } else {
    enqueue();
  }
}

function registerAuditHooks(sequelize, AuditLog) {
  sequelize.addHook('afterCreate', async (instance, options) => {
    const entityType = instance.constructor.name;
    if (!AUDITED_MODELS.has(entityType)) return;

    await AuditLog.create(
      {
        entity_type: entityType,
        entity_id: instance.id,
        action: 'create',
        actor_id: resolveActorId(entityType, instance.id),
        changes: redactSnapshot(instance.get({ plain: true })),
      },
      { transaction: options.transaction }
    );
  });

  sequelize.addHook('afterUpdate', async (instance, options) => {
    const entityType = instance.constructor.name;
    if (!AUDITED_MODELS.has(entityType)) return;

    const changedFields = instance.changed();
    if (!changedFields || changedFields.length === 0) return;

    const diff = {};
    for (const field of changedFields) {
      diff[field] = { old: instance.previous(field), new: instance.get(field) };
    }

    const isSoftDelete = diff.deleted_at && !diff.deleted_at.old && diff.deleted_at.new;

    enqueueAuditJob(
      {
        entityType,
        entityId: instance.id,
        action: isSoftDelete ? 'delete' : 'update',
        actor_id: resolveActorId(entityType, instance.id),
        changes: redactDiff(diff),
      },
      options.transaction
    );
  });

  sequelize.addHook('afterDestroy', async (instance, options) => {
    const entityType = instance.constructor.name;
    if (!AUDITED_MODELS.has(entityType)) return;

    enqueueAuditJob(
      {
        entityType,
        entityId: instance.id,
        action: 'delete',
        actor_id: resolveActorId(entityType, instance.id),
        changes: redactSnapshot(instance.get({ plain: true })),
      },
      options.transaction
    );
  });
}

module.exports = { registerAuditHooks, AUDITED_MODELS };
