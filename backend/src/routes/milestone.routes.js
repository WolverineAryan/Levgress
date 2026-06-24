const express = require('express');
const milestoneController = require('../controllers/milestone.controller');
const { protect, restrictTo } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(protect);

// Student submits evidence for a milestone
router.post('/:id/submit', restrictTo('STUDENT'), milestoneController.submitEvidence);

// Instructor manual validation/override endpoints
router.post('/:id/approve', restrictTo('STAFF'), milestoneController.staffApproveMilestone);
router.post('/:id/reject', restrictTo('STAFF'), milestoneController.staffRejectMilestone);

module.exports = router;
