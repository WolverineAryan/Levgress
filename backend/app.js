const express = require("express");
const cors = require("cors");

const authRoutes = require("./src/routes/auth.routes");
const statsRoutes = require("./src/routes/stats.routes");
const skillRoutes = require("./src/routes/skill.routes");
const projectRoutes = require("./src/routes/project.routes");
const badgeRoutes = require("./src/routes/badge.routes");
const activityRoutes = require("./src/routes/activity.routes");
const analyticsRoutes = require("./src/routes/analytics.routes");
const alertRoutes = require("./src/routes/alert.routes");
const userRoutes = require("./src/routes/user.routes");
const errorHandler = require("./src/middleware/error.middleware");
const rateLimit = require("./src/middleware/rateLimit");
const leaderboardRoutes = require("./src/routes/leaderboard.routes");
const xpRoutes = require("./src/routes/xp.routes");
const milestoneRoutes = require("./src/routes/milestone.routes");

const app = express();

// GLOBAL MIDDLEWARE
app.use(cors());
app.use(express.json());
app.use(rateLimit);

// ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/skills", skillRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/badges", badgeRoutes);
app.use("/api/activity", activityRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/users", userRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/xp", xpRoutes);
app.use("/api/milestones", milestoneRoutes);

// HEALTH CHECK
app.get("/api/health", (req, res) => {
  res.json({ status: "Backend running" });
});

// ERROR HANDLER (LAST)
app.use(errorHandler);

module.exports = app;
