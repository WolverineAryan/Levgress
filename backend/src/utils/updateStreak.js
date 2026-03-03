const StudentStats = require("../models/StudentStats");

const updateStreak = async (studentId) => {
  const stats = await StudentStats.findOne({ student: studentId });

  if (!stats) return;

  const today = new Date();
  const last = stats.lastActiveDate;

  const todayDate = new Date(today.setHours(0, 0, 0, 0));

  if (!last) {
    stats.currentStreak = 1;
  } else {
    const lastDate = new Date(last.setHours(0, 0, 0, 0));
    const diffDays = (todayDate - lastDate) / (1000 * 60 * 60 * 24);

    if (diffDays === 1) {
      stats.currentStreak += 1;
    } else if (diffDays > 1) {
      stats.currentStreak = 1;
    }
  }

  stats.lastActiveDate = todayDate;

  if (stats.currentStreak > stats.longestStreak) {
    stats.longestStreak = stats.currentStreak;
  }

  await stats.save();
};

module.exports = updateStreak;