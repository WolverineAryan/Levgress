const { logActivity } = require("./activity.service");

async function notifyStagnation(alert) {
  // Student notification
  global.io?.to(alert.studentId.toString()).emit("stagnation-alert", {
    level: alert.level,
    daysInactive: alert.daysInactive
  });

  // Activity log (staff-visible)
  await logActivity({
    userId: alert.studentId,
    type: "STAGNATION",
    message: `flagged as ${alert.level} due to inactivity`
  });
}

module.exports = { notifyStagnation };
