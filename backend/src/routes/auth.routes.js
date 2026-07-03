const express = require('express');
const authController = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/firebase-login', authController.firebaseLogin);
router.get('/me', protect, authController.getMe);
router.put('/onboard', protect, authController.onboard);
router.put('/update-profile', protect, authController.updateProfile);
router.get('/check-username/:username', protect, authController.checkUsername);
router.put('/update-password', protect, authController.updatePassword);

router.delete('/delete-account', protect, authController.deleteAccount);
router.post('/report-issue', protect, authController.reportIssue);

module.exports = router;
