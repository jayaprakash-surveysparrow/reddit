const router = require('express').Router();

const commentController = require('../controllers/comment');
const voteController = require('../controllers/vote');

router.patch('/:id', commentController.updateComment);
router.delete('/:id', commentController.deleteComment);

router.put('/:id/vote', voteController.castOrChangeCommentVote);
router.delete('/:id/vote', voteController.removeCommentVote);

module.exports = router;
