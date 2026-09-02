const router = require('express').Router();

const auditLogController = require('../controllers/auditLog');
const requireAuth = require('../middleware/requireAuth');
const { validate } = require('../middleware/validate');
const { pagination, auditLogFilters } = require('../middleware/schemas');

// Only requires being logged in — see the summary note on why this has no
// finer-grained authorization yet (no admin/moderator-of-everything concept
// exists in this app).
router.get(
  '/',
  requireAuth,
  validate(auditLogFilters.concat(pagination), 'query'),
  auditLogController.getAuditLogs
);

module.exports = router;
