const router = require('express').Router();

const communityController = require('../controllers/community');
const postController = require('../controllers/post');

router.post('/', communityController.createCommunity);
router.get('/', communityController.listCommunities);

router.get('/:name/members', communityController.listMembers);
router.post('/:name/join', communityController.joinCommunity);
router.delete('/:name/leave', communityController.leaveCommunity);

router.get('/:name/posts', postController.listCommunityPosts);
router.post('/:name/posts', postController.createPost);

router.get('/:name', communityController.getCommunity);
router.patch('/:name', communityController.updateCommunity);
router.delete('/:name', communityController.deleteCommunity);

module.exports = router;
