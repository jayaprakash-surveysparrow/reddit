const router = require('express').Router();

const commentController = require('../controllers/comment');
const voteController = require('../controllers/vote');
const requireAuth = require('../middleware/requireAuth');
const { validate } = require('../middleware/validate');
const { uuidParam } = require('../middleware/schemas');

router.patch('/:id', validate(uuidParam, 'params'), requireAuth, commentController.updateComment);
router.delete('/:id', validate(uuidParam, 'params'), requireAuth, commentController.deleteComment);

router.put('/:id/vote', validate(uuidParam, 'params'), requireAuth, voteController.castOrChangeCommentVote);
router.delete('/:id/vote', validate(uuidParam, 'params'), requireAuth, voteController.removeCommentVote);

module.exports = router;
