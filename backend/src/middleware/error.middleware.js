const config = require('../config/env');
const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Log error
  logger.error(`${err.message} - Path: ${req.originalUrl}`, err);

  if (config.nodeEnv === 'development') {
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  } else {
    // Production Mode: Send safe client errors, hide system details
    let error = { ...err };
    error.message = err.message;

    // Handle Mongoose cast errors (e.g. invalid ObjectId)
    if (err.name === 'CastError') {
      error.message = `Invalid field: ${err.path}`;
      error.statusCode = 400;
      error.status = 'fail';
    }

    // Handle Mongoose duplicate key errors (11000)
    if (err.code === 11000) {
      const field = Object.keys(err.keyValue)[0];
      error.message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists.`;
      error.statusCode = 400;
      error.status = 'fail';
    }

    // Handle Mongoose validation errors
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((el) => el.message);
      error.message = `Validation Error: ${messages.join('. ')}`;
      error.statusCode = 400;
      error.status = 'fail';
    }

    // Handle JWT Errors
    if (err.name === 'JsonWebTokenError') {
      error.message = 'Invalid token. Please log in again.';
      error.statusCode = 401;
      error.status = 'fail';
    }

    if (err.name === 'TokenExpiredError') {
      error.message = 'Your session has expired. Please log in again.';
      error.statusCode = 401;
      error.status = 'fail';
    }

    res.status(error.statusCode || 500).json({
      status: error.status || 'error',
      message: error.message || 'Internal Server Error',
    });
  }
};

module.exports = errorHandler;
