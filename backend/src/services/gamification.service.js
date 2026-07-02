const StudentStats = require('../models/StudentStats');
const User = require('../models/User');
const Project = require('../models/Project');
const Milestone = require('../models/Milestone');
const Badge = require('../models/Badge');
const StudentBadge = require('../models/StudentBadge');
const ActivityLog = require('../models/ActivityLog');
const MasterSkill = require('../models/MasterSkill');
const notificationService = require('./notification.service');
const socketConfig = require('../config/socket');
const { NotFoundError } = require('../utils/AppError');

const MAX_LEVEL = 100;

// Formula: XP needed to level up from level L (Optimized progressive curve)
// Level 1: 250 XP
// Level 2: 400 XP
// Level 3: 550 XP
// Level 4: 700 XP
const xpForLevelUp = (currentLevel) => {
  if (currentLevel >= MAX_LEVEL) return Infinity; // No more level ups
  return 250 + (currentLevel - 1) * 150;
};

// Calculate cumulative XP (for metrics/leaderboard) in O(1) time matching the progressive curve
const getCumulativeXP = (level, currentXP) => {
  const effectiveLevel = Math.min(level, MAX_LEVEL);
  const n = effectiveLevel - 1;
  const baseXP = n <= 0 ? 0 : 250 * n + 75 * n * (n - 1);
  return baseXP + currentXP;
};

const getOrCreateStats = async (studentId) => {
  let stats = await StudentStats.findOne({ user: studentId });
  if (!stats) {
    stats = await StudentStats.create({
      user: studentId,
      xp: 0,
      level: 1,
      streak: 0,
      skills: [],
    });
  }
  return stats;
};

const awardXP = async (studentId, amount, reason, shouldCheckBadges = true) => {
  const stats = await getOrCreateStats(studentId);

  let levelUpOccurred = false;
  const initialLevel = stats.level;

  stats.xp += amount;

  // Level Up loop
  while (stats.level < MAX_LEVEL && stats.xp >= xpForLevelUp(stats.level)) {
    stats.xp -= xpForLevelUp(stats.level);
    stats.level += 1;
    levelUpOccurred = true;
  }

  // Cap level and XP at max level
  if (stats.level >= MAX_LEVEL) {
    stats.level = MAX_LEVEL;
    stats.xp = 0;
  }

  await stats.save();

  // Log activity
  await ActivityLog.create({
    student: studentId,
    activityType: levelUpOccurred ? 'LEVEL_UP' : 'MILESTONE_COMPLETE',
    details: levelUpOccurred
      ? `Leveled up to Level ${stats.level}! Reason: ${reason}`
      : `Earned ${amount} XP. Reason: ${reason}`,
  });

  const xpNeeded = stats.level >= MAX_LEVEL ? Infinity : xpForLevelUp(stats.level);

  // If leveled up, notify student and trigger sockets
  if (levelUpOccurred) {
    const user = await User.findById(studentId);
    await notificationService.createNotification(
      studentId,
      'LEVEL_UP',
      `Congratulations ${user.name}! You have reached Level ${stats.level}!`,
      '/dashboard'
    );

    socketConfig.sendToUser(studentId.toString(), 'level-up', {
      level: stats.level,
      xp: stats.xp,
      xpNeeded,
    });

    // Check badges related to Level Up
    if (shouldCheckBadges) {
      await checkAndAwardBadges(studentId, 'LEVEL_UP', stats.level);
    }
  } else {
    // Just update XP progress on UI
    socketConfig.sendToUser(studentId.toString(), 'xp-update', {
      level: stats.level,
      xp: stats.xp,
      xpNeeded,
      earned: amount,
    });
  }

  // Also check general XP badges
  if (shouldCheckBadges) {
    const totalLifetimeXP = getCumulativeXP(stats.level, stats.xp);
    await checkAndAwardBadges(studentId, 'XP_TOTAL', totalLifetimeXP);
  }

  return {
    level: stats.level,
    xp: stats.xp,
    xpNeeded,
    levelUpOccurred,
  };
};

const updateStreak = async (studentId) => {
  const stats = await getOrCreateStats(studentId);

  const now = new Date();
  const lastActive = new Date(stats.lastActive);

  // Check difference in days
  const diffTime = Math.abs(now - lastActive);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    // Active on consecutive day, increment streak
    stats.streak += 1;
  } else if (diffDays > 1) {
    // Broke the streak
    stats.streak = 1;
  }

  stats.lastActive = now;
  await stats.save();

  // Check streak badges
  await checkAndAwardBadges(studentId, 'STREAK', stats.streak);
};

const checkAndAwardBadges = async (studentId, criteriaType, currentValue) => {
  try {
    // Find all badges matching the criteria type
    const badges = await Badge.find({ criteriaType });

    for (const badge of badges) {
      // Check if student qualifies
      if (currentValue >= badge.criteriaValue) {
        // Check if badge is already earned
        const alreadyEarned = await StudentBadge.findOne({
          student: studentId,
          badge: badge._id,
        });

        if (!alreadyEarned) {
          // Award badge!
          await StudentBadge.create({
            student: studentId,
            badge: badge._id,
          });

          // Log action
          await ActivityLog.create({
            student: studentId,
            activityType: 'BADGE_EARN',
            details: `Earned the "${badge.name}" Badge!`,
          });

          // Award XP for unlocking the badge
          const badgeXp = badge.xpReward || 200;
          await awardXP(studentId, badgeXp, `Unlocked the "${badge.name}" Badge`, false);

          // Send notification
          await notificationService.createNotification(
            studentId,
            'BADGE_EARNED',
            `You unlocked a new badge: ${badge.name}! (+${badgeXp} XP)`,
            '/badges'
          );

          // Emit socket event
          socketConfig.sendToUser(studentId.toString(), 'badge-earned', badge);
        }
      }
    }
  } catch (error) {
    console.error('Error awarding badges:', error);
  }
};

const addSkill = async (studentId, name, category) => {
  const stats = await getOrCreateStats(studentId);

  // Check if skill already added
  const skillExists = stats.skills.find(
    (s) => s.name.toLowerCase() === name.toLowerCase()
  );

  if (skillExists) {
    return stats;
  }

  // Fetch skill type
  const masterSkill = await MasterSkill.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
  const type = masterSkill ? masterSkill.type : 'TECHNOLOGY';

  stats.skills.push({ name, category, tier: 'UNVERIFIED', type });
  await stats.save();

  // Check badges for skills
  await checkAndAwardBadges(studentId, 'SKILL_COUNT', stats.skills.length);

  return stats;
};

const deleteSkill = async (studentId, name) => {
  const stats = await getOrCreateStats(studentId);

  stats.skills = stats.skills.filter(
    (s) => s.name.toLowerCase() !== name.toLowerCase()
  );
  await stats.save();

  return stats;
};

const updateSkillXP = async (studentId, name, category, amount) => {
  // Now a wrapper to auto-add skills without levels
  await addSkill(studentId, name, category || 'Other');
};

const submitSkillTest = async (studentId, skillName, tier) => {
  const stats = await getOrCreateStats(studentId);

  let skill = stats.skills.find(
    (s) => s.name.toLowerCase() === skillName.toLowerCase()
  );

  if (!skill) {
    const masterSkill = await MasterSkill.findOne({ name: { $regex: new RegExp(`^${skillName}$`, 'i') } });
    const category = masterSkill ? masterSkill.category : 'Other';
    const type = masterSkill ? masterSkill.type : 'TECHNOLOGY';
    stats.skills.push({ name: skillName, category, tier, type });
    skill = stats.skills[stats.skills.length - 1];
  } else {
    skill.tier = tier;
  }

  await stats.save();

  // Determine XP reward based on tier
  let xpReward = 150;
  if (tier === 'INTERMEDIATE') xpReward = 300;
  else if (tier === 'MASTER') xpReward = 500;

  // Award user XP
  const xpRes = await awardXP(studentId, xpReward, `Passed the "${skillName}" ${tier} Quiz`, true);

  // Send notification
  await notificationService.createNotification(
    studentId,
    'MILESTONE_VERIFIED',
    `Congratulations! You unlocked the "${skillName}" ${tier} tier! (+${xpReward} XP)`,
    '/skills'
  );

  // Recheck skills count badges
  await checkAndAwardBadges(studentId, 'SKILL_COUNT', stats.skills.length);

  // Check FRONTEND_SKILLS and BACKEND_SKILLS badges
  const frontendCount = stats.skills.filter(
    (s) => s.category.toLowerCase() === 'frontend' && s.tier !== 'UNVERIFIED'
  ).length;
  const backendCount = stats.skills.filter(
    (s) => s.category.toLowerCase() === 'backend' && s.tier !== 'UNVERIFIED'
  ).length;

  await checkAndAwardBadges(studentId, 'FRONTEND_SKILLS', frontendCount);
  await checkAndAwardBadges(studentId, 'BACKEND_SKILLS', backendCount);

  return {
    stats: xpRes,
    xpReward,
  };
};

module.exports = {
  awardXP,
  updateStreak,
  checkAndAwardBadges,
  addSkill,
  deleteSkill,
  updateSkillXP,
  submitSkillTest,
  getCumulativeXP,
  xpForLevelUp,
  MAX_LEVEL,
};
