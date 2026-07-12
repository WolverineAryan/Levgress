const Post = require('../models/Post');
const Project = require('../models/Project');
const User = require('../models/User');
const notificationService = require('../services/notification.service');
const asyncHandler = require('../middleware/asyncHandler');
const { NotFoundError, ForbiddenError, ValidationError } = require('../utils/AppError');

// Create a new post
const createPost = asyncHandler(async (req, res) => {
  const { text, projectId } = req.body;

  if (!text || !text.trim()) {
    throw new ValidationError('Post text content is required');
  }

  let linkedProject = null;
  if (projectId) {
    linkedProject = await Project.findById(projectId);
    if (!linkedProject) {
      throw new NotFoundError('Selected project not found');
    }
    // Verify the project belongs to the current user (if student)
    if (req.user.role === 'STUDENT' && linkedProject.student.toString() !== req.user._id.toString()) {
      throw new ForbiddenError('You can only attach your own projects to a post');
    }
  }

  const post = await Post.create({
    author: req.user._id,
    text: text.trim(),
    project: projectId || null,
  });

  // Handle Mentions
  try {
    const mentionRegex = /@([a-zA-Z0-9_-]+)/g;
    const matches = [...text.matchAll(mentionRegex)];
    const usernames = [...new Set(matches.map(m => m[1].toLowerCase()))];

    for (const username of usernames) {
      const userDoc = await User.findOne({ username });
      if (userDoc && userDoc._id.toString() !== req.user._id.toString()) {
        await notificationService.createNotification(
          userDoc._id,
          'POST_MENTION',
          `${req.user.name} mentioned you in a post: "${text.substring(0, 40)}${text.length > 40 ? '...' : ''}"`,
          `/showcase`
        );
      }
    }
  } catch (err) {
    console.error('Failed to process mentions in post:', err);
  }

  const populatedPost = await Post.findById(post._id)
    .populate('author', 'name email avatar role')
    .populate({
      path: 'project',
      populate: { path: 'student', select: 'name email avatar' }
    });

  res.status(201).json({
    status: 'success',
    data: { post: populatedPost },
  });
});

// Get all posts for feed
const getAllPosts = asyncHandler(async (req, res) => {
  const posts = await Post.find()
    .populate('author', 'name email avatar role')
    .populate({
      path: 'project',
      populate: { path: 'student', select: 'name email avatar' }
    })
    .populate('comments.author', 'name email avatar role')
    .sort({ createdAt: -1 });

  res.status(200).json({
    status: 'success',
    results: posts.length,
    data: { posts },
  });
});

// Like / Unlike a post
const likePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    throw new NotFoundError('Post not found');
  }

  const hasLiked = post.likes.includes(req.user._id);
  if (hasLiked) {
    post.likes.pull(req.user._id);
  } else {
    post.likes.push(req.user._id);
  }

  await post.save();

  const updatedPost = await Post.findById(post._id)
    .populate('author', 'name email avatar role')
    .populate({
      path: 'project',
      populate: { path: 'student', select: 'name email avatar' }
    })
    .populate('comments.author', 'name email avatar role');

  res.status(200).json({
    status: 'success',
    data: { post: updatedPost },
  });
});

// Add a comment to a post
const addComment = asyncHandler(async (req, res) => {
  const { text } = req.body;
  if (!text || !text.trim()) {
    throw new ValidationError('Comment text is required');
  }

  const post = await Post.findById(req.params.id);
  if (!post) {
    throw new NotFoundError('Post not found');
  }

  post.comments.push({
    author: req.user._id,
    text: text.trim(),
  });

  await post.save();

  // Handle Mentions in comment
  try {
    const mentionRegex = /@([a-zA-Z0-9_-]+)/g;
    const matches = [...text.matchAll(mentionRegex)];
    const usernames = [...new Set(matches.map(m => m[1].toLowerCase()))];

    for (const username of usernames) {
      const userDoc = await User.findOne({ username });
      if (userDoc && userDoc._id.toString() !== req.user._id.toString()) {
        await notificationService.createNotification(
          userDoc._id,
          'POST_MENTION',
          `${req.user.name} mentioned you in a comment: "${text.substring(0, 40)}${text.length > 40 ? '...' : ''}"`,
          `/showcase`
        );
      }
    }
  } catch (err) {
    console.error('Failed to process mentions in comment:', err);
  }

  const updatedPost = await Post.findById(post._id)
    .populate('author', 'name email avatar role')
    .populate({
      path: 'project',
      populate: { path: 'student', select: 'name email avatar' }
    })
    .populate('comments.author', 'name email avatar role');

  res.status(201).json({
    status: 'success',
    data: { post: updatedPost },
  });
});

// Delete a post
const deletePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    throw new NotFoundError('Post not found');
  }

  // Only the author or staff can delete the post
  if (req.user.role !== 'STAFF' && post.author.toString() !== req.user._id.toString()) {
    throw new ForbiddenError('You are not authorized to delete this post');
  }

  await Post.findByIdAndDelete(req.params.id);

  res.status(200).json({
    status: 'success',
    message: 'Post successfully deleted',
  });
});

module.exports = {
  createPost,
  getAllPosts,
  likePost,
  addComment,
  deletePost,
};
