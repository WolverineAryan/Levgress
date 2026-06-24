const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const StudentStats = require('../models/StudentStats');
const config = require('../config/env');
const { AuthError, ValidationError } = require('../utils/AppError');
const firebaseAdmin = require('../config/firebaseAdmin');

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
      const decodedToken = await firebaseAdmin.admin.auth().verifyIdToken(idToken);
      uid = decodedToken.uid;
      email = decodedToken.email;
      name = decodedToken.name || email.split('@')[0];
      avatar = decodedToken.picture || '';
    } catch (error) {
      throw new AuthError('Invalid Firebase Auth ID Token: ' + error.message);
    }
  } else {
    // Local developer mock mode
    console.log('Firebase SDK not initialized. Processing in Mock Auth mode.');
    email = idToken.includes('@') ? idToken : 'mockstudent@levgress.com';
    uid = `mock_uid_${email.replace(/[^a-zA-Z0-9]/g, '')}`;
    name = email.split('@')[0];
    avatar = '';
  }

  // Find user by firebaseUid or email (to link previous accounts)
  let user = await User.findOne({
    $or: [{ firebaseUid: uid }, { email: email.toLowerCase() }],
  });

  let isNewUser = false;

  if (!user) {
    isNewUser = true;
    // Create new User
    user = await User.create({
      name,
      email,
      firebaseUid: uid,
      role: chosenRole || 'STUDENT', // Default to STUDENT if not specified
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
  const { name, username, role, avatar, githubUrl, linkedinUrl, portfolioUrl, bio } = onboardingData;

  if (!name || !username || !role) {
    throw new ValidationError('Name, username, and role are required for onboarding');
  }

  if (!['STUDENT', 'STAFF'].includes(role)) {
    throw new ValidationError('Invalid role selected');
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
  if (avatar !== undefined) user.avatar = avatar;
  if (githubUrl !== undefined) user.githubUrl = githubUrl.trim();
  if (linkedinUrl !== undefined) user.linkedinUrl = linkedinUrl.trim();
  if (portfolioUrl !== undefined) user.portfolioUrl = portfolioUrl.trim();
  if (bio !== undefined) user.bio = bio.trim();
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

module.exports = {
  register,
  login,
  getMe,
  firebaseLogin,
  checkUsernameAvailability,
  onboardUser,
};
