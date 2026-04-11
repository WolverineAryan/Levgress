const ValidationLog = require("../models/validationLog.model");

// STUDENT ANALYTICS
const getStudentAnalytics = async (studentId) => {
  const logs = await ValidationLog.find({ studentId });

  if (!logs.length) {
    return {
      averageScore: 0,
      performance: "No data",
      strengths: [],
      weaknesses: [],
      consistency: 0
    };
  }

  const total = logs.reduce((sum, l) => sum + l.score, 0);
  const avg = Math.round(total / logs.length);

  const typeStats = {};

  logs.forEach((l) => {
    if (!typeStats[l.type]) {
      typeStats[l.type] = { total: 0, count: 0 };
    }
    typeStats[l.type].total += l.score;
    typeStats[l.type].count++;
  });

  const strengths = [];
  const weaknesses = [];

  for (let type in typeStats) {
    const tAvg = typeStats[type].total / typeStats[type].count;

    if (tAvg >= 75) strengths.push(type);
    if (tAvg < 50) weaknesses.push(type);
  }

  const variance =
    logs.reduce((sum, l) => sum + Math.pow(l.score - avg, 2), 0) /
    logs.length;

  const consistency = Math.max(0, 100 - Math.sqrt(variance));

  return {
    averageScore: avg,
    performance:
      avg > 75 ? "Strong" : avg > 50 ? "Moderate" : "Needs Improvement",
    strengths,
    weaknesses,
    consistency: Math.round(consistency)
  };
};

// PROJECT ANALYTICS
const getProjectAnalytics = async (projectId) => {
  const logs = await ValidationLog.find({ projectId });

  if (!logs.length) {
    return {
      projectScore: 0,
      quality: "No data"
    };
  }

  const avg =
    logs.reduce((sum, l) => sum + l.score, 0) / logs.length;

  return {
    projectScore: Math.round(avg),
    quality:
      avg > 75
        ? "High Quality"
        : avg > 50
        ? "Average"
        : "Low Quality"
  };
};

module.exports = {
  getStudentAnalytics,
  getProjectAnalytics
};