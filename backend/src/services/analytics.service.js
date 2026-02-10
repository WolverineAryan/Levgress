const StudentStats = require("../models/StudentStats");
const User = require("../models/User");

function daysBetween(date) {
  return Math.max(
    1,
    Math.floor((Date.now() - new Date(date)) / (1000 * 60 * 60 * 24))
  );
}

async function computeStudentAnalytics(studentId) {
  const stats = await StudentStats.findOne({ studentId });
  const user = await User.findById(studentId);

  if (!stats || !user) return null;

  const daysActive = daysBetween(user.createdAt);

  return {
    level: stats.level,
    lifetimeXP: stats.lifetimeXP,

    levelVelocity: (stats.level / daysActive).toFixed(2),
    skillGrowthRate: (stats.learnedSkillsCount / daysActive).toFixed(2),
    projectRate: (stats.completedProjectsCount / daysActive).toFixed(2),

    daysSinceLastActivity: daysBetween(stats.lastActivityAt),

    stagnation:
      daysBetween(stats.lastActivityAt) > 30
        ? "STAGNATED"
        : daysBetween(stats.lastActivityAt) > 14
        ? "SLOW"
        : "ACTIVE"
  };
}

async function computeBatchAnalytics(batch) {
  const users = await User.find({ batch, role: "STUDENT" });

  const analytics = await Promise.all(
    users.map(u => computeStudentAnalytics(u._id))
  );

  const valid = analytics.filter(Boolean);

  return {
    totalStudents: valid.length,
    averageLevel:
      valid.reduce((s, a) => s + a.level, 0) / (valid.length || 1),
    stagnatedCount: valid.filter(a => a.stagnation === "STAGNATED").length
  };
}

async function computeDepartmentAnalytics(department) {
  const users = await User.find({ department, role: "STUDENT" });

  const analytics = await Promise.all(
    users.map(u => computeStudentAnalytics(u._id))
  );

  const valid = analytics.filter(Boolean);

  return {
    totalStudents: valid.length,
    avgXP:
      valid.reduce((s, a) => s + a.lifetimeXP, 0) / (valid.length || 1),
    activeRatio:
      valid.filter(a => a.stagnation === "ACTIVE").length /
      (valid.length || 1)
  };
}

module.exports = {
  computeStudentAnalytics,
  computeBatchAnalytics,
  computeDepartmentAnalytics
};
