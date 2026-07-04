const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const StudentStats = require('../models/StudentStats');
const config = require('../config/env');
const { AuthError, ValidationError } = require('../utils/AppError');
const firebaseAdmin = require('../config/firebaseAdmin');
const { getAuth } = require('firebase-admin/auth');
const supabaseService = require('./supabase.service');

// Helper to generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });
};

const register = async (userData) => {
  const { name, email, password, role, batch, department } = userData;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ValidationError('Email is already registered');
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  // Create User
  const user = await User.create({
    name,
    email,
    passwordHash,
    role: role || 'STUDENT',
    onboarded: false,
  });

  // If student, initialize their stats
  if (user.role === 'STUDENT') {
    await StudentStats.create({
      user: user._id,
      xp: 0,
      level: 1,
      streak: 0,
      skills: [],
    });
  }

  // Generate Token
  const token = generateToken(user._id);

  // Return user details without password
  const userResponse = user.toObject();
  delete userResponse.passwordHash;

  return { user: userResponse, token };
};

const login = async (email, password) => {
  if (!email || !password) {
    throw new ValidationError('Please provide email and password');
  }

  // Find user and select passwordHash explicitly
  const user = await User.findOne({ email }).select('+passwordHash');
  if (!user || !(await user.comparePassword(password))) {
    throw new AuthError('Incorrect email or password');
  }

  // Generate Token
  const token = generateToken(user._id);

  // Return user details without password
  const userResponse = user.toObject();
  delete userResponse.passwordHash;

  return { user: userResponse, token };
};

const getMe = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AuthError('User no longer exists');
  }
  return user;
};

const firebaseLogin = async (idToken, chosenRole) => {
  let uid, email, name, avatar;

  if (firebaseAdmin.isInitialized()) {
    try {
      const decodedToken = await getAuth().verifyIdToken(idToken);
      uid = decodedToken.uid;
      email = decodedToken.email || `${uid}@github.levgress.com`;
      name = decodedToken.name || (decodedToken.email ? decodedToken.email.split('@')[0] : 'GitHub User');
      avatar = decodedToken.picture || '';
    } catch (error) {
      throw new AuthError('Invalid Firebase Auth ID Token: ' + error.message);
    }
  } else {
    // Prevent mock logins in production mode
    if (config.nodeEnv === 'production') {
      throw new AuthError('Firebase Admin SDK is not initialized. Mock sign-in is disabled in production.');
    }
    // Local developer mock mode
    console.log('Firebase SDK not initialized. Processing in Mock Auth mode.');
    
    let decodedMock = null;
    if (idToken && idToken.includes('.') && !idToken.includes('@')) {
      try {
        const jwt = require('jsonwebtoken');
        decodedMock = jwt.decode(idToken);
      } catch (err) {
        console.error('Failed to decode mock Firebase JWT:', err);
      }
    }

    if (decodedMock && decodedMock.email) {
      email = decodedMock.email;
      uid = decodedMock.user_id || decodedMock.sub || `mock_uid_${email.replace(/[^a-zA-Z0-9]/g, '')}`;
      name = decodedMock.name || email.split('@')[0];
      avatar = decodedMock.picture || '';
    } else {
      email = idToken.includes('@') ? idToken : 'mockstudent@levgress.com';
      uid = `mock_uid_${email.replace(/[^a-zA-Z0-9]/g, '')}`;
      name = email.split('@')[0];
      avatar = '';
    }
  }

  // Find user by firebaseUid or email (to link previous accounts)
  let user = await User.findOne({
    $or: [{ firebaseUid: uid }, { email: email.toLowerCase() }],
  });

  let isNewUser = false;

  if (!user) {
    isNewUser = true;
    // Create new User - Force role to STUDENT for security!
    user = await User.create({
      name,
      email,
      firebaseUid: uid,
      role: 'STUDENT',
      avatar,
      onboarded: false,
    });

    // Initialize stats if student
    if (user.role === 'STUDENT') {
      await StudentStats.create({
        user: user._id,
        xp: 0,
        level: 1,
        streak: 0,
        skills: [],
      });
    }
  } else {
    // If user exists but doesn't have firebaseUid linked, link it now
    if (!user.firebaseUid) {
      user.firebaseUid = uid;
      if (avatar && !user.avatar) {
        user.avatar = avatar;
      }
      await user.save();
    }
  }


  // Generate Token
  const token = generateToken(user._id);

  const userResponse = user.toObject();
  delete userResponse.passwordHash;
  delete userResponse.twoFactorSecret;

  return { user: userResponse, token, isNewUser };
};

const checkUsernameAvailability = async (username) => {
  if (!username) {
    throw new ValidationError('Username is required');
  }
  const cleanUsername = username.trim().toLowerCase();
  
  // Basic regex check for username format (3-20 characters, alphanumeric, underscores, hyphens)
  const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
  if (!usernameRegex.test(cleanUsername)) {
    throw new ValidationError('Username must be 3-20 characters long and contain only alphanumeric characters, underscores, or hyphens.');
  }

  const existingUser = await User.findOne({ username: cleanUsername });
  return { available: !existingUser };
};

const onboardUser = async (userId, onboardingData) => {
  const {
    name,
    username,
    role,
    avatar,
    githubUrl,
    linkedinUrl,
    portfolioUrl,
    bio,
    resumeUrl,
    resumeFile,
    phoneNumber,
    batch,
    department,
  } = onboardingData;

  if (!name || !username || !role) {
    throw new ValidationError('Name, username, and role are required for onboarding');
  }

  if (!['STUDENT', 'STAFF'].includes(role)) {
    throw new ValidationError('Invalid role selected');
  }

  if (role === 'STAFF' && !phoneNumber) {
    throw new ValidationError('Phone number is required for instructors');
  }

  const cleanUsername = username.trim().toLowerCase();

  // Validate format
  const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
  if (!usernameRegex.test(cleanUsername)) {
    throw new ValidationError('Username must be 3-20 characters long and contain only alphanumeric characters, underscores, or hyphens.');
  }

  // Check if username is already taken by another user
  const usernameTaken = await User.findOne({
    username: cleanUsername,
    _id: { $ne: userId }
  });
  if (usernameTaken) {
    throw new ValidationError('Username is already taken');
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new ValidationError('User not found');
  }

  // Update user details
  user.name = name.trim();
  user.username = cleanUsername;
  user.role = role;

  if (role === 'STAFF') {
    user.phoneNumber = phoneNumber.trim();
    // Clear student-specific fields to keep instructor profile minimal
    user.avatar = '';
    user.githubUrl = '';
    user.linkedinUrl = '';
    user.portfolioUrl = '';
    user.bio = '';
    user.resumeUrl = '';
    user.resumeFile = { fileName: '', fileData: '' };
    user.batch = '';
    user.department = '';
  } else {
    if (avatar !== undefined) {
      if (avatar && avatar.startsWith('data:')) {
        user.avatar = await supabaseService.uploadBase64File(avatar, 'levgress-assets', 'avatars', `avatar_${userId}`);
      } else {
        user.avatar = avatar;
      }
    }
    if (githubUrl !== undefined) user.githubUrl = githubUrl.trim();
    if (linkedinUrl !== undefined) user.linkedinUrl = linkedinUrl.trim();
    if (portfolioUrl !== undefined) user.portfolioUrl = portfolioUrl.trim();
    if (bio !== undefined) user.bio = bio.trim();
    if (resumeUrl !== undefined) user.resumeUrl = resumeUrl.trim();
    if (resumeFile !== undefined) {
      if (resumeFile.fileData && resumeFile.fileData.startsWith('data:')) {
        const publicUrl = await supabaseService.uploadBase64File(
          resumeFile.fileData,
          'levgress-assets',
          'resumes',
          `resume_${userId}`
        );
        user.resumeUrl = publicUrl;
        user.resumeFile = {
          fileName: resumeFile.fileName || '',
          fileData: publicUrl,
        };
      } else {
        user.resumeFile = {
          fileName: resumeFile.fileName || '',
          fileData: resumeFile.fileData || '',
        };
      }
    }
    if (batch !== undefined) user.batch = batch.trim();
    if (department !== undefined) user.department = department.trim();
  }
  user.onboarded = true;

  await user.save();

  // Initialize StudentStats if role is STUDENT and stats do not exist
  if (role === 'STUDENT') {
    const existingStats = await StudentStats.findOne({ user: userId });
    if (!existingStats) {
      await StudentStats.create({
        user: userId,
        xp: 0,
        level: 1,
        streak: 0,
        skills: [],
      });
    }
  }

  const userResponse = user.toObject();
  delete userResponse.passwordHash;

  return userResponse;
};

const updateUserProfile = async (userId, updateData) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ValidationError('User not found');
  }

  const {
    name,
    avatar,
    githubUrl,
    linkedinUrl,
    portfolioUrl,
    bio,
    resumeUrl,
    resumeFile,
    batch,
    department,
    phoneNumber,
    customBadgeTitle,
  } = updateData;

  if (name !== undefined) user.name = name.trim();
  if (customBadgeTitle !== undefined) user.customBadgeTitle = customBadgeTitle.trim();

  if (user.role === 'STAFF') {
    if (phoneNumber !== undefined) user.phoneNumber = phoneNumber.trim();
  } else {
    if (avatar !== undefined) {
      if (avatar && avatar.startsWith('data:')) {
        user.avatar = await supabaseService.uploadBase64File(avatar, 'levgress-assets', 'avatars', `avatar_${userId}`);
      } else {
        user.avatar = avatar;
      }
    }
    if (githubUrl !== undefined) user.githubUrl = githubUrl.trim();
    if (linkedinUrl !== undefined) user.linkedinUrl = linkedinUrl.trim();
    if (portfolioUrl !== undefined) user.portfolioUrl = portfolioUrl.trim();
    if (bio !== undefined) user.bio = bio.trim();
    if (resumeUrl !== undefined) user.resumeUrl = resumeUrl.trim();
    if (resumeFile !== undefined) {
      if (resumeFile && resumeFile.fileData && resumeFile.fileData.startsWith('data:')) {
        const publicUrl = await supabaseService.uploadBase64File(
          resumeFile.fileData,
          'levgress-assets',
          'resumes',
          `resume_${userId}`
        );
        user.resumeUrl = publicUrl;
        user.resumeFile = {
          fileName: resumeFile.fileName || '',
          fileData: publicUrl,
        };
      } else {
        user.resumeFile = resumeFile;
      }
    }
    if (batch !== undefined) user.batch = batch;
    if (department !== undefined) user.department = department;
  }

  await user.save();

  const userResponse = user.toObject();
  delete userResponse.passwordHash;
  return userResponse;
};

const updatePassword = async (userId, currentPassword, newPassword) => {
  const user = await User.findById(userId).select('+passwordHash');
  if (!user) {
    throw new ValidationError('User not found');
  }

  // If user has passwordHash, verify it
  if (user.passwordHash) {
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      throw new ValidationError('Current password is incorrect');
    }
  }

  // Salt and hash new password
  const salt = await bcrypt.genSalt(10);
  user.passwordHash = await bcrypt.hash(newPassword, salt);
  await user.save();

  const userResponse = user.toObject();
  delete userResponse.passwordHash;
  return userResponse;
};



const deleteAccount = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ValidationError('User not found');
  }

  const Project = require('../models/Project');
  const Comment = require('../models/Comment');
  const Milestone = require('../models/Milestone');
  const Report = require('../models/Report');
  
  const userProjects = await Project.find({ student: userId });
  for (const proj of userProjects) {
    await Milestone.deleteMany({ project: proj._id });
    await Comment.deleteMany({ project: proj._id });
  }

  await Project.deleteMany({ student: userId });
  await Comment.deleteMany({ author: userId });
  await Report.deleteMany({ user: userId });
  await User.findByIdAndDelete(userId);

  return { success: true };
};

const reportIssue = async (userId, category, description) => {
  if (!description) {
    throw new ValidationError('Report description is required');
  }

  const Report = require('../models/Report');
  const report = await Report.create({
    user: userId,
    category: category || 'BUG',
    description,
  });

  return report;
};

module.exports = {
  register,
  login,
  getMe,
  firebaseLogin,
  checkUsernameAvailability,
  onboardUser,
  updateUserProfile,
  updatePassword,
  deleteAccount,
  reportIssue,
};
