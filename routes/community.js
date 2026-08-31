const router = require('express').Router();

const communityController = require('../controllers/community');
const postController = require('../controllers/post');
const requireAuth = require('../middleware/requireAuth');

router.post('/', requireAuth, communityController.createCommunity);
router.get('/', communityController.listCommunities);

router.get('/:name/members', communityController.listMembers);
router.post('/:name/join', requireAuth, communityController.joinCommunity);
router.delete('/:name/leave', requireAuth, communityController.leaveCommunity);

router.get('/:name/posts', postController.listCommunityPosts);
router.post('/:name/posts', requireAuth, postController.createPost);

router.get('/:name', communityController.getCommunity);
router.patch('/:name', requireAuth, communityController.updateCommunity);
router.delete('/:name', requireAuth, communityController.deleteCommunity);

module.exports = router;
