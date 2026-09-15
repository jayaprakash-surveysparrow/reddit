const router = require('express').Router();
const {rateLimit} = require('../rateLimit/rateLimitMiddleware');
const communityController = require('../controllers/community');
const postController = require('../controllers/post');
const requireAuth = require('../middleware/requireAuth');
const { validate } = require('../middleware/validate');
const { cacheRoute } = require('../cache/cacheMiddleware');
const { communityNameParam, pagination, postSort, communitySearch, communityAutocompleteQuery } = require('../middleware/schemas');

router.post('/', requireAuth, communityController.createCommunity);
router.get(
  '/',
  validate(communitySearch.concat(pagination), 'query'),
  cacheRoute('listCommunities'),
  communityController.listCommunities
);

router.get(
  '/:name/members',
  validate(communityNameParam, 'params'),
  validate(pagination, 'query'),
  cacheRoute('listCommunityMembers'),
  communityController.listMembers
);
router.post('/:name/join', requireAuth, validate(communityNameParam, 'params'), communityController.joinCommunity);
router.delete('/:name/leave', requireAuth, validate(communityNameParam, 'params'), communityController.leaveCommunity);

router.get('/autocomplete', validate(communityAutocompleteQuery, 'query'), communityController.autocompleteCommunities);

router.get(
  '/:name/posts',
  validate(communityNameParam, 'params'),
  validate(postSort.concat(pagination), 'query'),
  cacheRoute('listCommunityPosts'),
  postController.listCommunityPosts
);
router.post('/:name/posts', requireAuth, rateLimit('write'), validate(communityNameParam, 'params'), postController.createPost);

router.get('/:name', validate(communityNameParam, 'params'), cacheRoute('getCommunity'), communityController.getCommunity);
router.patch('/:name', requireAuth, validate(communityNameParam, 'params'), validate(communityNameParam, 'params'), communityController.updateCommunity);
router.delete('/:name', requireAuth, validate(communityNameParam, 'params'), communityController.deleteCommunity);

module.exports = router;
