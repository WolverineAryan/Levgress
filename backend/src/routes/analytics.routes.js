const express = require("express");

const {
  studentAnalytics,
  projectAnalytics
} = require("../controllers/analytics.controller");

const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

// REAL ROUTES
router.get("/student", authMiddleware, studentAnalytics);
router.get("/project/:projectId", authMiddleware, projectAnalytics);

module.exports = router;