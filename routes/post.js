const router = require('express').Router();

const postController = require('../controllers/post');
const commentController = require('../controllers/comment');
const voteController = require('../controllers/vote');
const requireAuth = require('../middleware/requireAuth');
const { validate } = require('../middleware/validate');
const { uuidParam } = require('../middleware/schemas');
const { cacheRoute } = require('../cache/cacheMiddleware');

router.get('/:id', validate(uuidParam, 'params'), cacheRoute('getPost'), postController.getPost);
router.patch('/:id', validate(uuidParam, 'params'), requireAuth, postController.updatePost);
router.delete('/:id', validate(uuidParam, 'params'), requireAuth, postController.deletePost);

router.put('/:id/vote', validate(uuidParam, 'params'), requireAuth, voteController.castOrChangePostVote);
router.delete('/:id/vote', validate(uuidParam, 'params'), requireAuth, voteController.removePostVote);

router.post('/:id/comments', validate(uuidParam, 'params'), requireAuth, commentController.createComment);
router.get(
  '/:id/comments',
  validate(uuidParam, 'params'),
  cacheRoute('getPostComments'),
  commentController.getCommentTree
);

module.exports = router;
