const router = require('express').Router();

const postController = require('../controllers/post');

router.use('/auth', require('./auth'));
router.use('/users', require('./user'));
router.use('/communities', require('./community'));
router.use('/posts', require('./post'));
router.use('/comments', require('./comment'));

router.get('/feed', postController.getHomeFeed);

module.exports = router;
