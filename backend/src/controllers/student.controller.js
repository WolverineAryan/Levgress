const StudentStats = require('../models/StudentStats');
const User = require('../models/User');
const Project = require('../models/Project');
const Milestone = require('../models/Milestone');
const Badge = require('../models/Badge');
const StudentBadge = require('../models/StudentBadge');
const ActivityLog = require('../models/ActivityLog');
const gamificationService = require('../services/gamification.service');
const asyncHandler = require('../middleware/asyncHandler');
const { NotFoundError } = require('../utils/AppError');



const getStudentDashboard = asyncHandler(async (req, res) => {
  const studentId = req.user._id;

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

  // Count active projects
  const projects = await Project.find({ student: studentId }).sort({ updatedAt: -1 });
  const completedProjectsCount = projects.filter((p) => p.status === 'COMPLETED').length;
  const activeProjects = projects.filter((p) => p.status !== 'COMPLETED');

  // Fetch milestones for active projects to show progress
  const activeProjectIds = activeProjects.map((p) => p._id);
  const milestones = await Milestone.find({ project: { $in: activeProjectIds } }).sort({ index: 1 });

  // Group milestones by project
  const projectMilestonesMap = {};
  milestones.forEach((m) => {
    if (!projectMilestonesMap[m.project]) {
      projectMilestonesMap[m.project] = [];
    }
    projectMilestonesMap[m.project].push(m);
  });

  const activeProjectsWithProgress = activeProjects.map((p) => {
    const ms = projectMilestonesMap[p._id] || [];
    const completedCount = ms.filter((m) => m.status === 'COMPLETED').length;
    return {
      ...p.toObject(),
      milestonesCount: ms.length,
      completedMilestonesCount: completedCount,
      progressPercent: ms.length > 0 ? Math.round((completedCount / ms.length) * 100) : 0,
      milestones: ms,
    };
  });

  // Fetch recent activity logs
  const activityLogs = await ActivityLog.find({ student: studentId })
    .sort({ createdAt: -1 })
    .limit(10);

  // Fetch total badges earned
  const badgesCount = await StudentBadge.countDocuments({ student: studentId });

  res.status(200).json({
    status: 'success',
    data: {
      stats: {
        level: stats.level,
        xp: stats.xp,
        xpNeeded: gamificationService.xpForLevelUp(stats.level),
        streak: stats.streak,
        completedProjectsCount,
        badgesCount,
      },
      activeProjects: activeProjectsWithProgress,
      activityFeed: activityLogs,
    },
  });
});

const getLeaderboard = asyncHandler(async (req, res) => {
  const allStats = await StudentStats.find()
    .populate('user', 'name email avatar')
    .exec();

  // Map and sort by cumulative XP
  const leaderboard = allStats
    .map((s) => {
      const cumulativeXP = gamificationService.getCumulativeXP(s.level, s.xp);
      return {
        studentId: s.user._id,
        name: s.user.name,
        email: s.user.email,
        avatar: s.user.avatar,
        level: s.level,
        xp: s.xp,
        streak: s.streak,
        cumulativeXP,
      };
    })
    .sort((a, b) => b.cumulativeXP - a.cumulativeXP)
    .map((item, index) => ({ ...item, rank: index + 1 }));

  res.status(200).json({
    status: 'success',
    data: { leaderboard },
  });
});

const getMySkills = asyncHandler(async (req, res) => {
  let stats = await StudentStats.findOne({ user: req.user._id });
  if (!stats) {
    stats = await StudentStats.create({
      user: req.user._id,
      xp: 0,
      level: 1,
      streak: 0,
      skills: [],
    });
  }

  res.status(200).json({
    status: 'success',
    data: { skills: stats.skills },
  });
});

const addSkill = asyncHandler(async (req, res) => {
  const { name, category } = req.body;
  const stats = await gamificationService.addSkill(req.user._id, name, category);

  res.status(200).json({
    status: 'success',
    data: { skills: stats.skills },
  });
});

const getMyBadges = asyncHandler(async (req, res) => {
  const studentId = req.user._id;

  // Find all system badges
  const allBadges = await Badge.find();

  // Find earned badges
  const earnedStudentBadges = await StudentBadge.find({ student: studentId })
    .populate('badge')
    .sort({ earnedAt: -1 });

  // Filter out any orphaned badges where the badge document no longer exists
  const validEarnedStudentBadges = earnedStudentBadges.filter((sb) => sb.badge !== null);

  const earnedIds = validEarnedStudentBadges.map((sb) => sb.badge._id.toString());

  const badges = allBadges.map((badge) => {
    const isEarned = earnedIds.includes(badge._id.toString());
    const earnedData = isEarned ? validEarnedStudentBadges.find((sb) => sb.badge._id.toString() === badge._id.toString()) : null;

    return {
      _id: badge._id,
      name: badge.name,
      description: badge.description,
      icon: badge.icon,
      category: badge.category,
      xpReward: badge.xpReward || 200,
      isEarned,
      earnedAt: earnedData ? earnedData.earnedAt : null,
    };
  });

  res.status(200).json({
    status: 'success',
    data: { badges },
  });
});

const getAIInsights = asyncHandler(async (req, res) => {
  const studentId = req.user._id;

  // Fetch all completed milestones for student's projects to generate aggregate analysis
  const projects = await Project.find({ student: studentId });
  const projectIds = projects.map((p) => p._id);

  const completedMilestones = await Milestone.find({
    project: { $in: projectIds },
    status: 'COMPLETED',
    aiScore: { $ne: null },
  }).populate('project', 'title');

  if (completedMilestones.length === 0) {
    return res.status(200).json({
      status: 'success',
      data: {
        insightsAvailable: false,
        message: 'Complete at least one milestone with AI validation to generate AI insights.',
      },
    });
  }

  // Aggregate feedback and scores
  const totalScore = completedMilestones.reduce((acc, m) => acc + m.aiScore, 0);
  const averageScore = Math.round(totalScore / completedMilestones.length);

  // Analyze themes from completed milestones
  const feedbackList = completedMilestones.map((m) => `- Project "${m.project.title}", Milestone: "${m.title}": ${m.aiFeedback}`);

  // Construct structured insights
  // In a production app, we could send this to Groq to generate a custom summary. Let's do it in a lightweight rule-based way to save tokens, or we can make a quick Groq call if available.
  const strengths = [];
  const weaknesses = [];
  const recommendations = [];

  // Basic rule-based breakdown
  if (averageScore >= 90) {
    strengths.push('Excellent attention to detail and high compliance with milestone instructions.');
    recommendations.push('Consider pushing your projects into production environments and working on optimizations.');
  } else if (averageScore >= 80) {
    strengths.push('Consistent and functional evidence submissions.');
    recommendations.push('Focus on refining architecture designs and documentation clarity.');
  } else {
    weaknesses.push('High volume of rejected evidence items.');
    recommendations.push('Ensure you test your code locally and complete all scaffolding before submitting evidence.');
  }

  // Extract from feedback
  const feedbackConcat = feedbackList.join('\n');
  if (feedbackConcat.toLowerCase().includes('database') || feedbackConcat.toLowerCase().includes('schema')) {
    strengths.push('Familiarity with data models and database structure implementation.');
  }
  if (feedbackConcat.toLowerCase().includes('api') || feedbackConcat.toLowerCase().includes('route')) {
    strengths.push('Solid understanding of backend routing and RESTful architectures.');
  }
  if (feedbackConcat.toLowerCase().includes('css') || feedbackConcat.toLowerCase().includes('tailwind') || feedbackConcat.toLowerCase().includes('ui')) {
    strengths.push('Strong focus on styling and frontend component aesthetics.');
  }
  if (feedbackConcat.toLowerCase().includes('error') || feedbackConcat.toLowerCase().includes('try-catch')) {
    weaknesses.push('Backend routes occasionally lack detailed input validation or error boundaries.');
    recommendations.push('Integrate robust error boundaries and validation schemas.');
  }

  // Ensure arrays aren't empty
  if (strengths.length === 0) strengths.push('Adaptability in setting up basic structures.');
  if (weaknesses.length === 0) weaknesses.push('Scope creep: starting next milestones before completing architecture planning.');
  if (recommendations.length === 0) recommendations.push('Focus on refactoring code to extract business logic into service layers.');

  res.status(200).json({
    status: 'success',
    data: {
      insightsAvailable: true,
      averageScore,
      milestonesAnalyzedCount: completedMilestones.length,
      strengths,
      weaknesses,
      recommendations,
    },
  });
});

// Staff Dashboard Action: Metrics and alerts
const getStaffDashboard = asyncHandler(async (req, res) => {
  const studentsCount = await User.countDocuments({ role: 'STUDENT' });
  const projectsCount = await Project.countDocuments();
  const pendingMilestonesCount = await Milestone.countDocuments({ status: 'SUBMITTED' });

  // Calculate overall milestone completion rate
  const totalMilestones = await Milestone.countDocuments();
  const completedMilestones = await Milestone.countDocuments({ status: 'COMPLETED' });
  const completionRate = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

  // Stagnation Alerts: find students who haven't logged activity in 3+ days
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const inactiveStudentsStats = await StudentStats.find({
    lastActive: { $lt: threeDaysAgo },
  }).populate('user', 'name email avatar');

  const stagnationAlerts = inactiveStudentsStats.map((s) => {
    const daysInactive = Math.floor((new Date() - new Date(s.lastActive)) / (1000 * 60 * 60 * 24));
    let severity = 'SLOW';
    if (daysInactive >= 7) severity = 'CRITICAL';
    else if (daysInactive >= 5) severity = 'STAGNATED';

    return {
      studentId: s.user._id,
      name: s.user.name,
      email: s.user.email,
      avatar: s.user.avatar,
      lastActive: s.lastActive,
      daysInactive,
      severity,
    };
  }).sort((a, b) => b.daysInactive - a.daysInactive);

  // Fetch pending review submissions with details
  const pendingSubmissions = await Milestone.find({ status: 'SUBMITTED' })
    .populate({
      path: 'project',
      populate: { path: 'student', select: 'name email avatar' },
    })
    .sort({ updatedAt: 1 })
    .limit(10);

  res.status(200).json({
    status: 'success',
    data: {
      metrics: {
        studentsCount,
        projectsCount,
        pendingMilestonesCount,
        completionRate,
      },
      stagnationAlerts,
      pendingSubmissions,
    },
  });
});

module.exports = {
  getStudentDashboard,
  getLeaderboard,
  getMySkills,
  addSkill,
  getMyBadges,
  getAIInsights,
  getStaffDashboard,
};
