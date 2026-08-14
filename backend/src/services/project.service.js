const mongoose = require('mongoose');
const Project = require('../models/Project');
const supabaseService = require('./supabase.service');
const Milestone = require('../models/Milestone');
const Comment = require('../models/Comment');
const ActivityLog = require('../models/ActivityLog');
const socketConfig = require('../config/socket');
const { NotFoundError, ForbiddenError, ValidationError } = require('../utils/AppError');

const DEFAULT_MILESTONES = [
  {
    index: 1,
    title: 'Project Setup & Design Planning',
    description: 'Set up the repository, define database schemas, and create wireframes/architecture planning documentation.',
  },
  {
    index: 2,
    title: 'Core Backend Development',
    description: 'Implement database models, build core API routes/endpoints, and verify connectivity.',
  },
  {
    index: 3,
    title: 'Frontend Scaffolding & Core Pages',
    description: 'Build core user interface components, set up routing, and connect basic layout templates.',
  },
  {
    index: 4,
    title: 'API Integration & State Management',
    description: 'Connect the frontend client to the backend APIs, manage user state, and integrate core features.',
  },
  {
    index: 5,
    title: 'Testing, Deployment & Documentation',
    description: 'Write test cases, debug edge cases, deploy the project online, and write a clear README.',
  },
];

const createProject = async (studentId, projectData) => {
  const { title, description, githubUrl, liveUrl, techStack, visibility } = projectData;

  if (!title || !description) {
    throw new ValidationError('Title and description are required');
  }

  // Create project
  const project = await Project.create({
    title,
    description,
    student: studentId,
    githubUrl,
    liveUrl,
    techStack: techStack || [],
    status: 'PLANNING',
    visibility: visibility || 'PRIVATE',
  });

  // Create the 5 milestones
  const milestones = DEFAULT_MILESTONES.map((m) => ({
    project: project._id,
    index: m.index,
    title: m.title,
    description: m.description,
    status: m.index === 1 ? 'ACTIVE' : 'LOCKED', // Only first is ACTIVE, rest are LOCKED
  }));

  await Milestone.insertMany(milestones);

  // Log activity
  await ActivityLog.create({
    student: studentId,
    activityType: 'PROJECT_CREATE',
    details: `Created project "${title}"`,
  });

  // Emit event
  socketConfig.emitToAll('project-created', {
    projectId: project._id,
    title: project.title,
    studentId,
  });

  return project;
};

const getStudentProjects = async (studentId) => {
  return Project.find({ student: studentId }).sort({ createdAt: -1 });
};

const getProjectById = async (projectId, requestingUserId = null, requestingUserRole = null) => {
  const project = await Project.findById(projectId).populate('student', 'name email avatar');
  if (!project) {
    throw new NotFoundError('Project not found');
  }

  const isOwner = requestingUserId && project.student._id.toString() === requestingUserId.toString();
  const isStaff = requestingUserRole === 'STAFF';
  const isPublic = project.visibility === 'PUBLIC';

  if (!isOwner && !isStaff && !isPublic) {
    throw new ForbiddenError('You do not have permission to access this project');
  }

  let milestones = await Milestone.find({ project: projectId }).sort({ index: 1 });

  // Auto-seed milestones if project currently has none
  if (!milestones || milestones.length === 0) {
    const defaultMilestones = DEFAULT_MILESTONES.map((m) => ({
      project: project._id,
      index: m.index,
      title: m.title,
      description: m.description,
      status: m.index === 1 ? 'ACTIVE' : 'LOCKED',
    }));
    await Milestone.insertMany(defaultMilestones);
    milestones = await Milestone.find({ project: projectId }).sort({ index: 1 });
  }

  // Auto-sync project status with milestone completion
  const milestone5 = milestones.find((m) => m.index === 5);
  const isM5Completed = milestone5 && milestone5.status === 'COMPLETED';

  if (!isM5Completed && project.status === 'COMPLETED') {
    project.status = 'IN_PROGRESS';
    await project.save();
  } else if (isM5Completed && project.status !== 'COMPLETED') {
    project.status = 'COMPLETED';
    await project.save();
  }

  return {
    project,
    milestones,
  };
};

const updateProject = async (projectId, studentId, updateData) => {
  const project = await Project.findById(projectId);
  if (!project) {
    throw new NotFoundError('Project not found');
  }

  if (project.student.toString() !== studentId.toString()) {
    throw new ForbiddenError('You can only update your own projects');
  }

  const allowedFields = ['title', 'description', 'githubUrl', 'liveUrl', 'techStack', 'status', 'visibility'];
  allowedFields.forEach((field) => {
    if (updateData[field] !== undefined) {
      project[field] = updateData[field];
    }
  });

  if (updateData.screenshots !== undefined) {
    const uploadedScreenshots = [];
    for (const screenshot of updateData.screenshots) {
      if (screenshot.fileData && screenshot.fileData.startsWith('data:')) {
        const publicUrl = await supabaseService.uploadBase64File(
          screenshot.fileData,
          'levgress-assets',
          `projects/${projectId}`,
          `screenshot_${screenshot.fileName.replace(/\s+/g, '_')}`
        );
        uploadedScreenshots.push({
          fileName: screenshot.fileName,
          fileData: publicUrl,
        });
      } else {
        uploadedScreenshots.push(screenshot);
      }
    }
    project.screenshots = uploadedScreenshots;
  }

  await project.save();
  return project;
};

const deleteProject = async (projectId, studentId) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const project = await Project.findById(projectId).session(session);
    if (!project) {
      throw new NotFoundError('Project not found');
    }

    if (project.student.toString() !== studentId.toString()) {
      throw new ForbiddenError('You can only delete your own projects');
    }

    // Delete project, milestones, and comments within the transaction session
    await Project.findByIdAndDelete(projectId).session(session);
    await Milestone.deleteMany({ project: projectId }).session(session);
    await Comment.deleteMany({ project: projectId }).session(session);

    // Log deletion activity
    await ActivityLog.create([{
      student: studentId,
      activityType: 'PROJECT_DELETE',
      details: `Deleted project "${project.title}"`,
    }], { session });

    await session.commitTransaction();
    session.endSession();
    return { success: true };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const addComment = async (projectId, authorId, text, parentId = null) => {
  if (!text) {
    throw new ValidationError('Comment text is required');
  }

  const project = await Project.findById(projectId).populate('student');
  if (!project) {
    throw new NotFoundError('Project not found');
  }

  const User = require('../models/User');
  const author = await User.findById(authorId);
  if (!author) {
    throw new NotFoundError('User not found');
  }

  // Only instructors (STAFF) can post root questions/remarks
  if (!parentId && author.role !== 'STAFF') {
    throw new ForbiddenError('Only instructors can post new remarks or questions.');
  }

  const comment = await Comment.create({
    project: projectId,
    author: authorId,
    text,
    parent: parentId || null,
  });

  // Populate author details
  const populatedComment = await comment.populate('author', 'name email avatar role');

  // Notify student if a staff member commented
  const commentAuthor = populatedComment.author;
  if (commentAuthor.role === 'STAFF' && project.student._id.toString() !== authorId.toString()) {
    const notificationService = require('./notification.service');
    await notificationService.createNotification(
      project.student._id,
      'COMMENT_ADDED',
      `Instructor ${commentAuthor.name} commented on your project "${project.title}"`,
      `/project/${projectId}`
    );
  }

  // Emit comment event via sockets to project room
  socketConfig.emitToAll(`comment-project-${projectId}`, populatedComment);

  return populatedComment;
};

const getComments = async (projectId) => {
  return Comment.find({ project: projectId })
    .populate('author', 'name email avatar role')
    .sort({ createdAt: 1 });
};

// Staff Action & Public Showcase: Get all projects across all students (with pagination and visibility checks)
const getAllProjects = async (filters = {}, requestingUserId = null, requestingUserRole = null) => {
  const query = {};
  if (filters.status) query.status = filters.status;
  if (filters.studentId) query.student = filters.studentId;

  // Enforce visibility restriction for STUDENTs
  if (requestingUserRole === 'STUDENT') {
    query.$or = [
      { visibility: 'PUBLIC' },
      { student: requestingUserId }
    ];
  }

  // Parse pagination parameters
  const page = parseInt(filters.page, 10) || 1;
  const limit = Math.min(parseInt(filters.limit, 10) || 20, 50);
  const skip = (page - 1) * limit;

  const total = await Project.countDocuments(query);
  const projects = await Project.find(query)
    .populate('student', 'name email avatar')
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(limit);

  return {
    projects,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
};

const likeProject = async (projectId, userId) => {
  const project = await Project.findById(projectId);
  if (!project) {
    throw new NotFoundError('Project not found');
  }

  const hasLiked = project.likes.includes(userId);
  if (hasLiked) {
    project.likes.pull(userId);
  } else {
    project.likes.push(userId);
  }

  await project.save();
  return project;
};

module.exports = {
  createProject,
  getStudentProjects,
  getProjectById,
  updateProject,
  deleteProject,
  addComment,
  getComments,
  getAllProjects,
  likeProject,
};
