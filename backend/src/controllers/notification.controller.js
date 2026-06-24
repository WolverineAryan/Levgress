const notificationService = require('../services/notification.service');
const asyncHandler = require('../middleware/asyncHandler');

const getNotifications = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const result = await notificationService.getNotifications(req.user._id, page, limit);

  res.status(200).json({
    status: 'success',
    data: result,
  });
});

const markAsRead = asyncHandler(async (req, res) => {
  const notification = await notificationService.markAsRead(req.params.id, req.user._id);

  res.status(200).json({
    status: 'success',
    data: { notification },
  });
});

const markAllAsRead = asyncHandler(async (req, res) => {
  await notificationService.markAllAsRead(req.user._id);

  res.status(200).json({
    status: 'success',
    message: 'All notifications marked as read',
  });
});

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
};
