const StudentStats = require("../models/StudentStats");
const StagnationAlert = require("../models/StagnationAlert");
const User = require("../models/User");
const { notifyStagnation } = require("./stagnationNotify.service");

function daysSince(date) {
  return Math.floor(
    (Date.now() - new Date(date)) / (1000 * 60 * 60 * 24)
  );
}

function classify(days) {
  if (days > 45) return "CRITICAL";
  if (days > 30) return "STAGNATED";
  if (days > 14) return "SLOW";
  return null;
}

async function detectStagnation() {
  const statsList = await StudentStats.find();

  for (const stats of statsList) {
    const daysInactive = daysSince(stats.lastActivityAt);
    const level = classify(daysInactive);

    if (!level) continue;

    const existing = await StagnationAlert.findOne({
      studentId: stats.studentId,
      level,
      isResolved: false
    });

    if (existing) continue;

    const alert = await StagnationAlert.create({
      studentId: stats.studentId,
      level,
      daysInactive
    });
    await notifyStagnation(alert);
  }
}

module.exports = { detectStagnation };
