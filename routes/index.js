const router = require('express').Router();

const postController = require('../controllers/post');
const requireAuth = require('../middleware/requireAuth');
const { validate } = require('../middleware/validate');
const { pagination, postSort } = require('../middleware/schemas');
const { cacheRoute } = require('../cache/cacheMiddleware');

router.use('/auth', require('./auth'));
router.use('/users', require('./user'));
router.use('/communities', require('./community'));
router.use('/posts', require('./post'));
router.use('/comments', require('./comment'));
router.use('/audit-logs', require('./auditLog'));

// requireAuth must run before cacheRoute here: the feed's cache key is
// per-user (req.user.id), so the cache layer needs auth to have already run.
router.get(
  '/feed',
  requireAuth,
  validate(postSort.concat(pagination), 'query'),
  cacheRoute('getHomeFeed'),
  postController.getHomeFeed
);

module.exports = router;
