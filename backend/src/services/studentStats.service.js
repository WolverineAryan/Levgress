const StudentStats = require("../models/StudentStats");

async function updateLastActivity(studentId) {
  await StudentStats.findOneAndUpdate(
    { studentId },
    { lastActivityAt: new Date() }
  );
}

async function incrementSkillCount(studentId) {
  await StudentStats.findOneAndUpdate(
    { studentId },
    { $inc: { learnedSkillsCount: 1 }, lastActivityAt: new Date() }
  );
}

async function incrementProjectCount(studentId) {
  await StudentStats.findOneAndUpdate(
    { studentId },
    { $inc: { completedProjectsCount: 1 }, lastActivityAt: new Date() }
  );
}

module.exports = {
  updateLastActivity,
  incrementSkillCount,
  incrementProjectCount
};
