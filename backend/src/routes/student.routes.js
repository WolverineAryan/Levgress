const express = require('express');
const studentController = require('../controllers/student.controller');
const { protect, restrictTo } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(protect);

// Student endpoints
router.get('/dashboard', restrictTo('STUDENT'), studentController.getStudentDashboard);
router.get('/leaderboard', studentController.getLeaderboard);
router.get('/skills', restrictTo('STUDENT'), studentController.getMySkills);
router.get('/skills/master', restrictTo('STUDENT'), studentController.getMasterSkills);
router.post('/skills', restrictTo('STUDENT'), studentController.addSkill);
router.delete('/skills', restrictTo('STUDENT'), studentController.deleteSkill);
router.get('/badges', restrictTo('STUDENT'), studentController.getMyBadges);
router.get('/ai-insights', restrictTo('STUDENT'), studentController.getAIInsights);

// Profiles and Skill Testing
router.get('/profile/:id', studentController.getStudentProfile);
router.get('/by-username/:username', studentController.getStudentByUsername);
router.get('/skills/test/generate', restrictTo('STUDENT'), studentController.generateSkillQuestions);
router.post('/skills/test/submit', restrictTo('STUDENT'), studentController.submitSkillTestResult);

// Staff Dashboard endpoints
router.get('/staff-dashboard', restrictTo('STAFF'), studentController.getStaffDashboard);

// Instructor Roster & Analytics
router.get('/roster', restrictTo('STAFF'), studentController.getAllStudents);
router.get('/roster/:id', restrictTo('STAFF'), studentController.getStudentDetailedProfile);
router.get('/cohort-analytics', restrictTo('STAFF'), studentController.getCohortAnalytics);

module.exports = router;
