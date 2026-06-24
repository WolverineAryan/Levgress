const express = require('express');
const authController = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/firebase-login', authController.firebaseLogin);
router.get('/me', protect, authController.getMe);
router.put('/onboard', protect, authController.onboard);
router.get('/check-username/:username', protect, authController.checkUsername);

module.exports = router;
