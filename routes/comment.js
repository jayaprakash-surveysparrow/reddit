const router = require('express').Router();

const commentController = require('../controllers/comment');
const voteController = require('../controllers/vote');
const requireAuth = require('../middleware/requireAuth');

router.patch('/:id', requireAuth, commentController.updateComment);
router.delete('/:id', requireAuth, commentController.deleteComment);

router.put('/:id/vote', requireAuth, voteController.castOrChangeCommentVote);
router.delete('/:id/vote', requireAuth, voteController.removeCommentVote);

module.exports = router;
