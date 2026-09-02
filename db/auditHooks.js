const { getCurrentActorId } = require('./auditContext');

// Only these models get audited. Deliberately excludes RefreshToken and
// PasswordResetToken: those are high-frequency, ephemeral security plumbing
// (a new row on every login/refresh), not user-facing content — auditing
// them would flood the log with noise unrelated to what an audit trail is
// actually for here (who created/edited/deleted what content).
const AUDITED_MODELS = new Set(['User', 'Community', 'CommunityMember', 'Post', 'Comment', 'PostVote', 'CommentVote']);

// Never store a secret in an audit row, even redacted-but-shaped.
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

// Signup and password-reset-via-token both mutate a User row with no
// requireAuth having run first, so there's no ambient actor in context.
// Both are genuinely self-service actions, so falling back to "the user
// acted on themselves" is the correct attribution, not a guess.
function resolveActorId(entityType, instanceId) {
  const actorId = getCurrentActorId();
  if (actorId) return actorId;
  return entityType === 'User' ? instanceId : null;
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

    // Every soft-delete in this app is an UPDATE that sets deleted_at from
    // null to a timestamp — classify that as a delete, not a generic update,
    // so "show me every deletion" is a plain filter on `action` instead of
    // requiring every caller to inspect the diff for a deleted_at change.
    const isSoftDelete = diff.deleted_at && !diff.deleted_at.old && diff.deleted_at.new;

    await AuditLog.create(
      {
        entity_type: entityType,
        entity_id: instance.id,
        action: isSoftDelete ? 'delete' : 'update',
        actor_id: resolveActorId(entityType, instance.id),
        changes: redactDiff(diff),
      },
      { transaction: options.transaction }
    );
  });

  sequelize.addHook('afterDestroy', async (instance, options) => {
    const entityType = instance.constructor.name;
    if (!AUDITED_MODELS.has(entityType)) return;

    await AuditLog.create(
      {
        entity_type: entityType,
        entity_id: instance.id,
        action: 'delete',
        actor_id: resolveActorId(entityType, instance.id),
        changes: redactSnapshot(instance.get({ plain: true })),
      },
      { transaction: options.transaction }
    );
  });
}

module.exports = { registerAuditHooks, AUDITED_MODELS };
