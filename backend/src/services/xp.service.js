const StudentStats = require("../models/StudentStats");
const eventBus = require("../events/dispatcher");
const EVENTS = require("../events/constants");
const { xpForNextLevel } = require("./level.utils");

async function addXP(studentId, xp) {
  const stats = await StudentStats.findOne({ studentId });
  if (!stats) return;

  stats.currentXP += xp;
  stats.lifetimeXP += xp;
  stats.lastActivityAt = new Date();

  while (stats.level < 100 && stats.currentXP >= xpForNextLevel(stats.level)) {
    stats.currentXP -= xpForNextLevel(stats.level);
    stats.level += 1;

    eventBus.emit(EVENTS.LEVEL_UP, {
      studentId,
      level: stats.level
    });
  }

  await stats.save();
}

module.exports = { addXP };
