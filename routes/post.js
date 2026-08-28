const router = require('express').Router();

const postController = require('../controllers/post');
const commentController = require('../controllers/comment');
const voteController = require('../controllers/vote');

router.get('/:id', postController.getPost);
router.patch('/:id', postController.updatePost);
router.delete('/:id', postController.deletePost);

router.put('/:id/vote', voteController.castOrChangePostVote);
router.delete('/:id/vote', voteController.removePostVote);

router.post('/:id/comments', commentController.createComment);
router.get('/:id/comments', commentController.getCommentTree);

module.exports = router;
