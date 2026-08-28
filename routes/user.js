const router = require('express').Router();

const userController = require('../controllers/user');

// /me must be registered before /:username so it isn't swallowed as a username.
router.get('/me', userController.getCurrentUser);
router.patch('/me', userController.updateCurrentUser);

router.get('/:username/posts', userController.getUserPosts);
router.get('/:username/comments', userController.getUserComments);
router.get('/:username', userController.getUserProfile);

module.exports = router;
