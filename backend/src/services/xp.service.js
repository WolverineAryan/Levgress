const User = require("../models/User");
const XpHistory = require("../models/XpHistory");
const Badge = require("../models/Badge");

async function awardXP(studentId, xpAmount, reason) {

  const student = await User.findById(studentId);

  if (!student) {
    throw new Error("Student not found");
  }

  const previousLevel = student.level || 1;

  student.xp = (student.xp || 0) + xpAmount;

  student.level = Math.floor(student.xp / 100) + 1;

  await student.save();

  await XpHistory.create({
    studentId: student._id,
    xpChange: xpAmount,
    totalXpAfter: student.xp,
    reason
  });

  let badge = null;

  const levelBadges = {
    5: "Level 5 Achiever",
    10: "Level 10 Master",
    20: "Elite Performer"
  };

  if (student.level > previousLevel && levelBadges[student.level]) {

    const exists = await Badge.findOne({
      userId: student._id,
      title: levelBadges[student.level]
    });

    if (!exists) {
      badge = await Badge.create({
        userId: student._id,
        title: levelBadges[student.level],
        description: `Reached Level ${student.level}`
      });
    }

  }

  return {
    xp: student.xp,
    level: student.level,
    badge
  };
}

module.exports = awardXP;