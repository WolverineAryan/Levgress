const Notification = require('../models/Notification');
const socketConfig = require('../config/socket');
const { NotFoundError } = require('../utils/AppError');

const createNotification = async (recipientId, type, message, link = '') => {
  const notification = await Notification.create({
    recipient: recipientId,
    type,
    message,
    link,
  });

  // Emit event in real-time to the recipient's room
  socketConfig.sendToUser(recipientId.toString(), 'notification', notification);

  return notification;
};

const getNotifications = async (userId, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  const notifications = await Notification.find({ recipient: userId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Notification.countDocuments({ recipient: userId });
  const unreadCount = await Notification.countDocuments({ recipient: userId, isRead: false });

  return {
    notifications,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
    unreadCount,
  };
};

const markAsRead = async (notificationId, userId) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, recipient: userId },
    { isRead: true },
    { new: true }
  );

  if (!notification) {
    throw new NotFoundError('Notification not found or access denied');
  }

  return notification;
};

const markAllAsRead = async (userId) => {
  await Notification.updateMany({ recipient: userId, isRead: false }, { isRead: true });
  return { success: true };
};

module.exports = {
  createNotification,
  getNotifications,
  markAsRead,
  markAllAsRead,
};
