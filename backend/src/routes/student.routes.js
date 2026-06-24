const express = require('express');
const studentController = require('../controllers/student.controller');
const { protect, restrictTo } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(protect);

// Student endpoints
router.get('/dashboard', restrictTo('STUDENT'), studentController.getStudentDashboard);
router.get('/leaderboard', studentController.getLeaderboard);
router.get('/skills', restrictTo('STUDENT'), studentController.getMySkills);
router.post('/skills', restrictTo('STUDENT'), studentController.addSkill);
router.get('/badges', restrictTo('STUDENT'), studentController.getMyBadges);
router.get('/ai-insights', restrictTo('STUDENT'), studentController.getAIInsights);

// Staff Dashboard endpoints
router.get('/staff-dashboard', restrictTo('STAFF'), studentController.getStaffDashboard);

module.exports = router;
