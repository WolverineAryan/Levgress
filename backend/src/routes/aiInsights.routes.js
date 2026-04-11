const express = require("express");

const { getAIInsights } = require("../controllers/aiInsights.controller");

const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/", authMiddleware, getAIInsights);

module.exports = router;