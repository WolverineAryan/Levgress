const Announcement = require('../models/Announcement');
const User = require('../models/User');
const notificationService = require('./notification.service');
const { NotFoundError, ForbiddenError, ValidationError } = require('../utils/AppError');

const createAnnouncement = async (authorId, data) => {
  const { title, description, company, link, deadline, batch, department } = data;

  if (!title || !title.trim()) {
    throw new ValidationError('Announcement title is required');
  }
  if (!description || !description.trim()) {
    throw new ValidationError('Announcement description is required');
  }

  const announcement = await Announcement.create({
    title: title.trim(),
    description: description.trim(),
    company: company ? company.trim() : '',
    link: link ? link.trim() : '',
    deadline: deadline ? new Date(deadline) : null,
    batch: batch || 'All Batches',
    department: department || 'All Departments',
    author: authorId,
  });

  // Send notifications to target students
  try {
    const studentQuery = { role: 'STUDENT' };
    if (batch && batch !== 'All Batches') studentQuery.batch = batch;
    if (department && department !== 'All Departments') studentQuery.department = department;

    const targetStudents = await User.find(studentQuery).select('_id');
    for (const student of targetStudents) {
      await notificationService.createNotification(
        student._id,
        'SYSTEM_ANNOUNCEMENT',
        `New Placement Opportunity: "${title.trim()}" posted by Placement Cell.`,
        '/announcements'
      );
    }
  } catch (err) {
    console.error('Failed to dispatch notifications for announcement:', err);
  }

  return await Announcement.findById(announcement._id).populate('author', 'name email avatar role');
};

const getAnnouncements = async (user) => {
  let query = {};
  
  if (user.role === 'STUDENT') {
    query = {
      $and: [
        { $or: [{ batch: 'All Batches' }, { batch: user.batch }] },
        { $or: [{ department: 'All Departments' }, { department: user.department }] },
      ],
    };
  }

  const announcements = await Announcement.find(query)
    .populate('author', 'name email avatar role')
    .populate('applicants.student', 'name email avatar batch department')
    .sort({ createdAt: -1 });

  return announcements;
};

const deleteAnnouncement = async (announcementId, authorId) => {
  const announcement = await Announcement.findById(announcementId);
  if (!announcement) {
    throw new NotFoundError('Announcement not found');
  }

  if (announcement.author.toString() !== authorId.toString()) {
    throw new ForbiddenError('Only the authoring instructor can delete this announcement');
  }

  await Announcement.findByIdAndDelete(announcementId);
  return true;
};

const toggleApplyAnnouncement = async (announcementId, studentId) => {
  const announcement = await Announcement.findById(announcementId);
  if (!announcement) {
    throw new NotFoundError('Announcement not found');
  }

  const existingIdx = announcement.applicants.findIndex(
    (a) => a.student.toString() === studentId.toString()
  );

  let hasApplied = false;
  if (existingIdx > -1) {
    // Un-apply
    announcement.applicants.splice(existingIdx, 1);
    hasApplied = false;
  } else {
    // Apply
    announcement.applicants.push({
      student: studentId,
      appliedAt: new Date(),
    });
    hasApplied = true;
  }

  await announcement.save();

  const updated = await Announcement.findById(announcementId)
    .populate('author', 'name email avatar role')
    .populate('applicants.student', 'name email avatar batch department');

  return {
    announcement: updated,
    hasApplied,
  };
};

const getAnnouncementApplicants = async (announcementId) => {
  const announcement = await Announcement.findById(announcementId)
    .populate('applicants.student', 'name email avatar batch department');

  if (!announcement) {
    throw new NotFoundError('Announcement not found');
  }

  return announcement.applicants;
};

module.exports = {
  createAnnouncement,
  getAnnouncements,
  deleteAnnouncement,
  toggleApplyAnnouncement,
  getAnnouncementApplicants,
};
