const express = require('express');
const announcementController = require('../controllers/announcement.controller');
const { protect, restrictTo } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(announcementController.getAnnouncements)
  .post(restrictTo('STAFF'), announcementController.createAnnouncement);

router.route('/:id')
  .delete(restrictTo('STAFF'), announcementController.deleteAnnouncement);

router.post('/:id/toggle-apply', restrictTo('STUDENT'), announcementController.toggleApplyAnnouncement);
router.get('/:id/applicants', restrictTo('STAFF'), announcementController.getAnnouncementApplicants);

module.exports = router;
