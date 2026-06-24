const jwt = require('jsonwebtoken');
const config = require('../config/env');
const User = require('../models/User');
const { AuthError, ForbiddenError } = require('../utils/AppError');
const asyncHandler = require('./asyncHandler');

const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Read token from Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw new AuthError('Not authorized to access this route. Please log in.');
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, config.jwtSecret);

    // Get user from database
    const user = await User.findById(decoded.id);
    if (!user) {
      throw new AuthError('The user belonging to this token no longer exists.');
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    throw new AuthError('Not authorized. Token is invalid or expired.');
  }
});

const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new ForbiddenError('You do not have permission to perform this action.');
    }
    next();
  };
};

module.exports = {
  protect,
  restrictTo,
};
