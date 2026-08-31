const router = require('express').Router();

const postController = require('../controllers/post');
const requireAuth = require('../middleware/requireAuth');

router.use('/auth', require('./auth'));
router.use('/users', require('./user'));
router.use('/communities', require('./community'));
router.use('/posts', require('./post'));
router.use('/comments', require('./comment'));

router.get('/feed', requireAuth, postController.getHomeFeed);

module.exports = router;
