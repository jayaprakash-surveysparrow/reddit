const router = require('express').Router();

const userController = require('../controllers/user');
const requireAuth = require('../middleware/requireAuth');
const { validate } = require('../middleware/validate');
const { pagination, userNameParam } = require('../middleware/schemas');
const { cacheRoute } = require('../cache/cacheMiddleware');

// /me must be registered before /:username so it isn't swallowed as a username.
router.get('/me', requireAuth, userController.getCurrentUser);
router.patch('/me', requireAuth, userController.updateCurrentUser);

router.get(
  '/:username/posts',
  validate(userNameParam, 'params'),
  validate(pagination, 'query'),
  cacheRoute('getUserPosts'),
  userController.getUserPosts
);
router.get(
  '/:username/comments',
  validate(userNameParam, 'params'),
  validate(pagination, 'query'),
  cacheRoute('getUserComments'),
  userController.getUserComments
);
router.get('/:username', validate(userNameParam, 'params'), cacheRoute('getUserProfile'), userController.getUserProfile);

module.exports = router;
