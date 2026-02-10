const Badge = require("../models/Badge");
const StudentBadge = require("../models/StudentBadge");
const BadgeLog = require("../models/BadgeEvaluationLog");
const StudentStats = require("../models/StudentStats");
const { checkCriteria } = require("../services/badgeCriteria.service");
const { logActivity } = require("../services/activity.service");

async function evaluateBadges(eventType, studentId) {
  const stats = await StudentStats.findOne({ studentId });
  if (!stats) return;

  const badges = await Badge.find({
    isActive: true,
    triggerEvents: eventType
  });

  for (const badge of badges) {
    const alreadyEarned = await StudentBadge.exists({
      studentId,
      badgeId: badge._id
    });
    if (alreadyEarned) continue;

    const eligible = checkCriteria(badge.criteria, stats);

    await BadgeLog.create({
      studentId,
      badgeId: badge._id,
      eventType,
      result: eligible ? "EARNED" : "NOT_EARNED"
    });

    if (!eligible) continue;

    await StudentBadge.create({
      studentId,
      badgeId: badge._id
    });
  }

  await logActivity({
  userId: studentId,
  type: "BADGE_EARNED",
  message: `earned the badge "${badge.name}"`,
  referenceId: badge._id
});

global.io?.to(studentId.toString()).emit("badge-earned", {
  badgeName: badge.name,
  icon: badge.iconUrl
});

}

module.exports = { evaluateBadges };

