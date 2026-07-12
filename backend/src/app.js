const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const config = require('./config/env');
const errorHandler = require('./middleware/error.middleware');
const { NotFoundError } = require('./utils/AppError');

// Import routes
const authRoutes = require('./routes/auth.routes');
const projectRoutes = require('./routes/project.routes');
const milestoneRoutes = require('./routes/milestone.routes');
const studentRoutes = require('./routes/student.routes');
const notificationRoutes = require('./routes/notification.routes');
const postRoutes = require('./routes/post.routes');

const app = express();

// Security HTTP Headers
app.use(helmet());

// CORS config
app.use(
  cors({
    origin: config.clientUrl,
    credentials: true,
  })
);

// Rate Limiting (1000 requests per 15 minutes for production responsiveness)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: 'Too many requests from this IP, please try again in 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// Parse JSON request body (increased limit for Base64 image/PDF uploads)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Sanitize inputs against NoSQL query injection
app.use(mongoSanitize());

// Health check route for Render
app.get('/', (req, res) => {
  res.status(200).json({ status: 'success', message: 'Levgress API is running' });
});

// Ignore favicon requests
app.get('/favicon.ico', (req, res) => res.status(204).end());

// Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/milestones', milestoneRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/posts', postRoutes);

// Fallback for unhandled routes
app.all('*', (req, res, next) => {
  next(new NotFoundError(`Cannot find ${req.originalUrl} on this server`));
});

// Global Error Handler
app.use(errorHandler);

module.exports = app;
