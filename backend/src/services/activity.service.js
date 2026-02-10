const ActivityLog = require("../models/ActivityLog");

async function logActivity({
  userId,
  type,
  message,
  referenceId = null
}) {
  return ActivityLog.create({
    userId,
    activityType: type,
    message,
    referenceId
  });
}

module.exports = { logActivity };
