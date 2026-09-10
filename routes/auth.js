const router = require('express').Router();
const {rateLimit} = require('../rateLimit/rateLimitMiddleware');
const authController = require('../controllers/auth');

router.post('/signup', rateLimit('auth'), authController.signup);
router.post('/login', rateLimit('auth'), authController.login);
router.post('/forgot-password', rateLimit('auth'), authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/refresh', rateLimit('auth'), authController.refreshAccessToken);
router.post('/logout', authController.logout);

module.exports = router;
