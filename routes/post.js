const router = require('express').Router();

const postController = require('../controllers/post');
const commentController = require('../controllers/comment');
const voteController = require('../controllers/vote');
const requireAuth = require('../middleware/requireAuth');

router.get('/:id', postController.getPost);
router.patch('/:id', requireAuth, postController.updatePost);
router.delete('/:id', requireAuth, postController.deletePost);

router.put('/:id/vote', requireAuth, voteController.castOrChangePostVote);
router.delete('/:id/vote', requireAuth, voteController.removePostVote);

router.post('/:id/comments', requireAuth, commentController.createComment);
router.get('/:id/comments', commentController.getCommentTree);

module.exports = router;
