const StudentStats = require("../models/StudentStats");
const User = require("../models/User");
const XpHistory = require("../models/XpHistory");
const Badge = require("../models/Badge");

const updateStreak = async (studentId) => {
  const stats = await StudentStats.findOne({ studentId });
  if (!stats) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let bonusXP = 0;
  let badgeAwarded = null;

  if (!stats.activityDates) stats.activityDates = [];
  stats.activityDates.push(today);

  if (!stats.lastActiveDate) {
    stats.currentStreak = 1;
  } else {
    const last = new Date(stats.lastActiveDate);
    last.setHours(0, 0, 0, 0);

    const diff = (today - last) / (1000 * 60 * 60 * 24);

    if (diff === 1) {
  stats.currentStreak += 1;
} else if (diff > 1) {
  // 🔥 Save previous streak before reset
  stats.previousStreak = stats.currentStreak;
  stats.currentStreak = 1;
  stats.recoveryAvailable = true;
}
  }

  stats.lastActiveDate = today;

  if (stats.currentStreak > stats.longestStreak) {
    stats.longestStreak = stats.currentStreak;
  }

  // 🔥 XP BONUS LOGIC
  if (stats.currentStreak === 7) bonusXP = 20;
  if (stats.currentStreak === 30) bonusXP = 50;

  if (bonusXP > 0) {
    const user = await User.findById(studentId);
    user.xp += bonusXP;
    user.level = Math.floor(user.xp / 100) + 1;
    await user.save();

    await XpHistory.create({
      studentId,
      xpChange: bonusXP,
      totalXpAfter: user.xp,
      reason: `Streak Bonus (${stats.currentStreak} days)`,
    });
  }

  // 🏅 BADGE LOGIC
  if (stats.currentStreak === 7) {
    const existing = await Badge.findOne({
      userId: studentId,
      title: "Consistency Starter",
    });

    if (!existing) {
      badgeAwarded = await Badge.create({
        userId: studentId,
        title: "Consistency Starter",
        description: "Maintained a 7-day activity streak",
      });
    }
  }

  await stats.save();

  return {
    currentStreak: stats.currentStreak,
    longestStreak: stats.longestStreak,
    bonusXP,
    badgeAwarded,
  };
};

module.exports = updateStreak;
