const router = require('express').Router();

const adminController = require('../controllers/admin');
const requireAuth = require('../middleware/requireAuth');
const { validate } = require('../middleware/validate');
const { communityNameParam, userNameParam, activityQuery, topActiveQuery } = require('../middleware/schemas');

// No admin/role system exists in this app yet — these routes are gated by
// requireAuth only, same as any other authenticated endpoint. Restrict
// further once a real admin role is introduced.
router.get(
  '/communities/:name/activity',
  requireAuth,
  validate(communityNameParam, 'params'),
  validate(activityQuery, 'query'),
  adminController.getCommunityActivity
);

router.get(
  '/users/:username/activity',
  requireAuth,
  validate(userNameParam, 'params'),
  validate(activityQuery, 'query'),
  adminController.getUserActivity
);

router.get(
  '/top-active',
  requireAuth,
  validate(topActiveQuery, 'query'),
  adminController.getTopActive
);

module.exports = router;
