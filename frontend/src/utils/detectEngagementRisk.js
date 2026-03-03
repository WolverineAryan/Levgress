const StudentStats = require("../models/StudentStats");

const detectEngagementRisk = async (studentId) => {
  const stats = await StudentStats.findOne({ studentId });
  if (!stats) return null;

  const today = new Date();
  const last = new Date(stats.lastActiveDate);

  const diffDays = (today - last) / (1000 * 60 * 60 * 24);

  if (diffDays >= 7) return "CRITICAL";
  if (diffDays >= 3) return "STAGNATED";

  return "ACTIVE";
};

module.exports = detectEngagementRisk;