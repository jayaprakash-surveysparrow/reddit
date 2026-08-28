const router = require('express').Router();

const authController = require('../controllers/auth');

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/refresh', authController.refreshAccessToken);
router.post('/logout', authController.logout);

module.exports = router;
