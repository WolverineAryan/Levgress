const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth.routes");
const statsRoutes = require("./routes/stats.routes")
const skillRoutes = require("./routes/skill.routes");
const projectRoutes = require("./routes/project.routes");
const badgeRoutes = require("./routes/badge.routes")
const activityRoutes = require("./routes/activity.routes");
const analyticsRoutes = require("./routes/analytics.routes");
const alertRoutes = require("./routes/alert.routes");
const errorHandler = require("./middleware/error.middleware");
const rateLimit = require("./middleware/rateLimit");
const validate = require("../middleware/validate");

const app = express();


app.use("/api/stats", statsRoutes);
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/skills", skillRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/badges", badgeRoutes);
app.use("/api/activity", activityRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/alerts", alertRoutes);
app.use(errorHandler);
app.use(rateLimit)
app.get("/api/health", (req, res) => {
  res.json({ status: "Backend running" });
});

module.exports = app;
