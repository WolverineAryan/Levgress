const announcementService = require('../services/announcement.service');
const asyncHandler = require('../middleware/asyncHandler');

const createAnnouncement = asyncHandler(async (req, res) => {
  const announcement = await announcementService.createAnnouncement(req.user._id, req.body);
  res.status(201).json({
    status: 'success',
    data: { announcement },
  });
});

const getAnnouncements = asyncHandler(async (req, res) => {
  const announcements = await announcementService.getAnnouncements(req.user);
  res.status(200).json({
    status: 'success',
    results: announcements.length,
    data: { announcements },
  });
});

const deleteAnnouncement = asyncHandler(async (req, res) => {
  await announcementService.deleteAnnouncement(req.params.id, req.user._id);
  res.status(200).json({
    status: 'success',
    message: 'Announcement deleted successfully',
  });
});

const toggleApplyAnnouncement = asyncHandler(async (req, res) => {
  const result = await announcementService.toggleApplyAnnouncement(req.params.id, req.user._id);
  res.status(200).json({
    status: 'success',
    data: result,
  });
});

const getAnnouncementApplicants = asyncHandler(async (req, res) => {
  const applicants = await announcementService.getAnnouncementApplicants(req.params.id);
  res.status(200).json({
    status: 'success',
    results: applicants.length,
    data: { applicants },
  });
});

module.exports = {
  createAnnouncement,
  getAnnouncements,
  deleteAnnouncement,
  toggleApplyAnnouncement,
  getAnnouncementApplicants,
};
