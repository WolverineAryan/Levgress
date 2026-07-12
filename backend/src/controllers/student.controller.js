const StudentStats = require('../models/StudentStats');
const User = require('../models/User');
const Project = require('../models/Project');
const Milestone = require('../models/Milestone');
const Badge = require('../models/Badge');
const StudentBadge = require('../models/StudentBadge');
const ActivityLog = require('../models/ActivityLog');
const gamificationService = require('../services/gamification.service');
const asyncHandler = require('../middleware/asyncHandler');
const { NotFoundError, ValidationError } = require('../utils/AppError');
const config = require('../config/env');
const { getRealisticQuiz, shuffleQuiz } = require('../utils/mockQuizzes');

const QuizQuestion = require('../models/QuizQuestion');
const MasterSkill = require('../models/MasterSkill');

const populateStatsSkills = async (skills) => {
  const masterSkills = await MasterSkill.find();
  const masterMap = new Map(masterSkills.map(s => [s.name.toLowerCase(), s]));
  return skills.map((s) => {
    const sObj = s.toObject ? s.toObject() : { ...s };
    const master = masterMap.get(s.name.toLowerCase());
    if (master) {
      sObj.type = master.type;
      sObj.category = master.category;
    }
    return sObj;
  });
};





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
    .filter((s) => s.user !== null)
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

  const populatedSkills = await populateStatsSkills(stats.skills);

  res.status(200).json({
    status: 'success',
    data: { skills: populatedSkills },
  });
});

const addSkill = asyncHandler(async (req, res) => {
  const { name, category } = req.body;

  if (!name) {
    throw new ValidationError('Skill name is required');
  }

  const normalized = name.trim().toLowerCase();
  const invalidSkills = ['groq api', 'groq ai', 'groq', 'celery', 'prisma'];
  if (invalidSkills.includes(normalized)) {
    throw new ValidationError(`"${name}" is not a valid skill for students`);
  }

  const stats = await gamificationService.addSkill(req.user._id, name, category);

  res.status(200).json({
    status: 'success',
    data: { skills: stats.skills },
  });
});

const deleteSkill = asyncHandler(async (req, res) => {
  const { name } = req.body;

  if (!name) {
    throw new ValidationError('Skill name is required');
  }

  const stats = await gamificationService.deleteSkill(req.user._id, name);
  const populatedSkills = await populateStatsSkills(stats.skills);

  res.status(200).json({
    status: 'success',
    data: { skills: populatedSkills },
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
  const { batch, department } = req.query;

  const userQuery = { role: 'STUDENT' };
  if (batch) userQuery.batch = batch;
  if (department) userQuery.department = department;

  const students = await User.find(userQuery).select('_id');
  const studentIds = students.map((s) => s._id);

  if (studentIds.length === 0) {
    return res.status(200).json({
      status: 'success',
      data: {
        metrics: {
          studentsCount: 0,
          projectsCount: 0,
          pendingMilestonesCount: 0,
          completionRate: 0,
        },
        stagnationAlerts: [],
        pendingSubmissions: [],
      },
    });
  }

  const studentsCount = studentIds.length;
  const projectsCount = await Project.countDocuments({ student: { $in: studentIds } });

  const projects = await Project.find({ student: { $in: studentIds } }).select('_id');
  const projectIds = projects.map((p) => p._id);

  const pendingMilestonesCount = await Milestone.countDocuments({
    project: { $in: projectIds },
    status: 'SUBMITTED',
  });

  // Calculate overall milestone completion rate
  const totalMilestones = await Milestone.countDocuments({ project: { $in: projectIds } });
  const completedMilestones = await Milestone.countDocuments({ project: { $in: projectIds }, status: 'COMPLETED' });
  const completionRate = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

  // Stagnation Alerts: find students who haven't logged activity in 3+ days
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

  const inactiveStudentsStats = await StudentStats.find({
    user: { $in: studentIds },
    lastActive: { $lt: threeDaysAgo },
  }).populate('user', 'name email avatar');

  const stagnationAlerts = inactiveStudentsStats
    .filter((s) => s.user)
    .map((s) => {
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
    })
    .sort((a, b) => b.daysInactive - a.daysInactive);

  // Fetch pending review submissions with details
  const pendingSubmissions = await Milestone.find({
    project: { $in: projectIds },
    status: 'SUBMITTED',
  })
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

const getStudentProfile = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id);
  if (!user || user.role !== 'STUDENT') {
    throw new NotFoundError('Student profile not found');
  }

  // Fetch student stats
  let stats = await StudentStats.findOne({ user: id });
  if (!stats && user.role === 'STUDENT') {
    stats = await StudentStats.create({
      user: id,
      xp: 0,
      level: 1,
      streak: 0,
      skills: [],
    });
  }

  // Fetch projects
  const projects = await Project.find({ student: id }).sort({ updatedAt: -1 });

  // Fetch badges earned
  const earnedStudentBadges = await StudentBadge.find({ student: id })
    .populate('badge')
    .sort({ earnedAt: -1 });

  const validEarnedStudentBadges = earnedStudentBadges.filter((sb) => sb.badge !== null);

  const populatedSkills = stats ? await populateStatsSkills(stats.skills) : [];

  // Compute profile tags dynamically
  const tags = [];
  if (stats) {
    if (stats.level >= 10) {
      tags.push('Elite Developer');
    } else if (stats.level >= 5) {
      tags.push('Rising Star');
    }

    const frontendSkills = populatedSkills.filter(
      (s) => s.category.toLowerCase() === 'frontend' && s.tier !== 'UNVERIFIED'
    );
    const backendSkills = populatedSkills.filter(
      (s) => s.category.toLowerCase() === 'backend' && s.tier !== 'UNVERIFIED'
    );

    if (frontendSkills.length >= 3) {
      tags.push('UI Expert');
    }
    if (backendSkills.length >= 3) {
      tags.push('Backend Guru');
    }
  }

  // If they have completed at least 3 projects
  const completedProjects = projects.filter((p) => p.status === 'COMPLETED');
  if (completedProjects.length >= 3) {
    tags.push('Productivity Beast');
  }

  res.status(200).json({
    status: 'success',
    data: {
      profile: {
        _id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        avatar: user.avatar,
        bio: user.bio,
        role: user.role,
        githubUrl: user.githubUrl,
        linkedinUrl: user.linkedinUrl,
        portfolioUrl: user.portfolioUrl,
        resumeUrl: user.resumeUrl,
        resumeFile: user.resumeFile,
        batch: user.batch || '',
        department: user.department || '',
        tags,
      },
      stats: stats ? {
        level: stats.level,
        xp: stats.xp,
        xpNeeded: gamificationService.xpForLevelUp(stats.level),
        streak: stats.streak,
        skills: populatedSkills,
      } : null,
      badges: validEarnedStudentBadges.map((sb) => ({
        _id: sb.badge._id,
        name: sb.badge.name,
        description: sb.badge.description,
        icon: sb.badge.icon,
        category: sb.badge.category,
        xpReward: sb.badge.xpReward,
        earnedAt: sb.earnedAt,
      })),
      projects,
    },
  });
});

const generateSkillQuestions = asyncHandler(async (req, res) => {
  const { skillName, tier } = req.query;

  if (!skillName || !tier) {
    throw new ValidationError('skillName and tier are required');
  }

  if (!['BASIC', 'INTERMEDIATE', 'MASTER'].includes(tier)) {
    throw new ValidationError('Invalid tier specified');
  }

  // 1. Try to serve from the database cache first
  const regex = new RegExp(`^${skillName}$`, 'i');
  const dbQuestions = await QuizQuestion.find({ skillName: { $regex: regex }, tier });

  if (dbQuestions.length >= 3) {
    console.log(`[Quiz] Loaded ${dbQuestions.length} questions for ${skillName} (${tier}) from DB.`);
    const shuffled = shuffleQuiz(dbQuestions);
    return res.status(200).json({
      status: 'success',
      data: { questions: shuffled.slice(0, 3) },
    });
  }

  // 2. Generate from mock dataset and cache in DB
  console.log(`[Quiz] DB miss for ${skillName} (${tier}). Loading from mock dataset and caching.`);
  const mockQuestions = getRealisticQuiz(skillName, tier);

  const docs = mockQuestions.map((q) => ({
    skillName,
    tier,
    question: q.question,
    options: q.options,
    answerIndex: q.answerIndex,
  }));

  try {
    await QuizQuestion.insertMany(docs);
    console.log(`[Quiz] Cached ${docs.length} mock questions for ${skillName} (${tier}).`);
  } catch (err) {
    console.error('[Quiz] Error caching mock questions to DB:', err.message);
  }

  return res.status(200).json({
    status: 'success',
    data: { questions: shuffleQuiz(mockQuestions).slice(0, 3) },
  });
});

const submitSkillTestResult = asyncHandler(async (req, res) => {
  const studentId = req.user._id;
  const { skillName, tier, passed } = req.body;

  if (!skillName || !tier) {
    throw new ValidationError('skillName and tier are required');
  }

  if (passed) {
    const result = await gamificationService.submitSkillTest(studentId, skillName, tier);
    return res.status(200).json({
      status: 'success',
      data: {
        passed: true,
        stats: result.stats,
        xpReward: result.xpReward,
      },
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      passed: false,
      message: 'Keep studying and try again!',
    },
  });
});

const getMockQuestions = (skillName, tier) => {
  const realistic = getRealisticQuiz(skillName, tier);
  if (realistic) {
    return realistic;
  }

  return [
    {
      question: `What is a primary concept or foundational feature of ${skillName} at the ${tier} level?`,
      options: [
        `Option A: Core feature and basic usage of ${skillName}`,
        `Option B: Secondary syntax details`,
        `Option C: Advanced configuration framework`,
        `Option D: Legacy deprecated behaviors`
      ],
      answerIndex: 0
    },
    {
      question: `Which of the following describes a typical troubleshooting scenario for ${skillName} (${tier})?`,
      options: [
        `Incorrect scoping parameters`,
        `Standard default setup (Recommended)`,
        `Third-party extensions override`,
        `Operating system memory leaks`
      ],
      answerIndex: 1
    },
    {
      question: `What is the recommended best practice for optimizing performance in ${skillName} during ${tier} tasks?`,
      options: [
        `Compile all modules synchronously`,
        `Avoid unnecessary recalculations and caches`,
        `Use modular imports and profile bottlenecks`,
        `Disable security scanning controls`
      ],
      answerIndex: 2
    }
  ];
};


// ─────────────────────────────────────────
// INSTRUCTOR / STAFF CONTROLLER FUNCTIONS
// ─────────────────────────────────────────

const getAllStudents = asyncHandler(async (req, res) => {
  const { batch, department, search } = req.query;

  const query = { role: 'STUDENT' };

  if (batch) {
    query.batch = batch;
  }
  if (department) {
    query.department = department;
  }
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { username: { $regex: search, $options: 'i' } },
    ];
  }

  // Fetch all matching students
  const students = await User.find(query)
    .select('name email username avatar onboarded createdAt batch department')
    .sort({ createdAt: -1 });

  // For each student, join stats, badge count, project count
  const enriched = await Promise.all(
    students.map(async (s) => {
      const stats = await StudentStats.findOne({ user: s._id });
      const badgesCount = await StudentBadge.countDocuments({ student: s._id });
      const projectsCount = await Project.countDocuments({ student: s._id });
      const completedProjectsCount = await Project.countDocuments({ student: s._id, status: 'COMPLETED' });

      let daysInactive = null;
      let severity = 'ACTIVE';
      if (stats && stats.lastActive) {
        daysInactive = Math.floor((new Date() - new Date(stats.lastActive)) / (1000 * 60 * 60 * 24));
        if (daysInactive >= 7) severity = 'CRITICAL';
        else if (daysInactive >= 5) severity = 'STAGNATED';
        else if (daysInactive >= 3) severity = 'SLOW';
        else severity = 'ACTIVE';
      }

      return {
        _id: s._id,
        name: s.name,
        email: s.email,
        username: s.username,
        avatar: s.avatar,
        onboarded: s.onboarded,
        createdAt: s.createdAt,
        batch: s.batch || '',
        department: s.department || '',
        level: stats ? stats.level : 1,
        xp: stats ? stats.xp : 0,
        streak: stats ? stats.streak : 0,
        lastActive: stats ? stats.lastActive : null,
        skillsCount: stats ? stats.skills.length : 0,
        verifiedSkillsCount: stats ? stats.skills.filter((sk) => sk.tier !== 'UNVERIFIED').length : 0,
        badgesCount,
        projectsCount,
        completedProjectsCount,
        daysInactive,
        severity,
      };
    })
  );

  res.status(200).json({
    status: 'success',
    data: { students: enriched, count: enriched.length },
  });
});

const getStudentDetailedProfile = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id);
  if (!user || user.role !== 'STUDENT') {
    throw new NotFoundError('Student not found');
  }

  const stats = await StudentStats.findOne({ user: id });
  const projects = await Project.find({ student: id }).sort({ updatedAt: -1 });

  // Attach milestones to each project
  const projectsWithMilestones = await Promise.all(
    projects.map(async (p) => {
      const milestones = await Milestone.find({ project: p._id }).sort({ index: 1 });
      return { ...p.toObject(), milestones };
    })
  );

  const earnedStudentBadges = await StudentBadge.find({ student: id }).populate('badge').sort({ earnedAt: -1 });
  const validBadges = earnedStudentBadges.filter((sb) => sb.badge !== null);

  const activityLogs = await ActivityLog.find({ student: id }).sort({ createdAt: -1 }).limit(20);

  const populatedSkills = stats ? await populateStatsSkills(stats.skills) : [];

  // Compute tags
  const tags = [];
  if (stats) {
    if (stats.level >= 10) tags.push('Elite Developer');
    else if (stats.level >= 5) tags.push('Rising Star');

    const frontendSkills = populatedSkills.filter(
      (s) => s.category.toLowerCase() === 'frontend' && s.tier !== 'UNVERIFIED'
    );
    const backendSkills = populatedSkills.filter(
      (s) => s.category.toLowerCase() === 'backend' && s.tier !== 'UNVERIFIED'
    );
    const masterSkills = populatedSkills.filter((s) => s.tier === 'MASTER');

    if (frontendSkills.length >= 3) tags.push('UI Expert');
    if (backendSkills.length >= 3) tags.push('Backend Guru');
    if (masterSkills.length >= 2) tags.push('Skill Master');
  }

  const completedProjects = projects.filter((p) => p.status === 'COMPLETED');
  if (completedProjects.length >= 3) tags.push('Productivity Beast');
  if (completedProjects.length >= 1) tags.push('Shipped It');

  // Compute inactivity
  let daysInactive = null;
  let severity = 'ACTIVE';
  if (stats && stats.lastActive) {
    daysInactive = Math.floor((new Date() - new Date(stats.lastActive)) / (1000 * 60 * 60 * 24));
    if (daysInactive >= 7) severity = 'CRITICAL';
    else if (daysInactive >= 5) severity = 'STAGNATED';
    else if (daysInactive >= 3) severity = 'SLOW';
  }

  res.status(200).json({
    status: 'success',
    data: {
      profile: {
        _id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        avatar: user.avatar,
        bio: user.bio,
        role: user.role,
        githubUrl: user.githubUrl,
        linkedinUrl: user.linkedinUrl,
        portfolioUrl: user.portfolioUrl,
        resumeUrl: user.resumeUrl,
        resumeFile: user.resumeFile,
        onboarded: user.onboarded,
        createdAt: user.createdAt,
        tags,
        daysInactive,
        severity,
      },
      stats: stats ? {
        level: stats.level,
        xp: stats.xp,
        xpNeeded: gamificationService.xpForLevelUp(stats.level),
        streak: stats.streak,
        lastActive: stats.lastActive,
        skills: populatedSkills,
      } : null,
      projects: projectsWithMilestones,
      badges: validBadges.map((sb) => ({
        _id: sb.badge._id,
        name: sb.badge.name,
        description: sb.badge.description,
        icon: sb.badge.icon,
        category: sb.badge.category,
        xpReward: sb.badge.xpReward,
        earnedAt: sb.earnedAt,
      })),
      activityLogs,
    },
  });
});

const getCohortAnalytics = asyncHandler(async (req, res) => {
  const { batch, department } = req.query;

  const studentQuery = { role: 'STUDENT' };
  if (batch) studentQuery.batch = batch;
  if (department) studentQuery.department = department;

  const students = await User.find(studentQuery).select('_id');
  const studentIds = students.map((s) => s._id);

  if (studentIds.length === 0) {
    return res.status(200).json({
      status: 'success',
      data: {
        milestoneStatusBreakdown: [],
        levelDistribution: [],
        tierDistribution: [],
        topTechnologies: [],
        milestoneScoresByIndex: [],
        projectStatusBreakdown: [],
        avgCohortLevel: 0,
        totalStudents: 0,
      },
    });
  }

  // Fetch projects belonging to these students
  const projects = await Project.find({ student: { $in: studentIds } });
  const projectIds = projects.map((p) => p._id);

  // 1. Milestone status breakdown
  const milestoneStatuses = ['LOCKED', 'ACTIVE', 'SUBMITTED', 'COMPLETED', 'REJECTED'];
  const milestoneStatusCounts = await Promise.all(
    milestoneStatuses.map(async (status) => ({
      status,
      count: await Milestone.countDocuments({ project: { $in: projectIds }, status }),
    }))
  );

  // 2. Level distribution
  const allStats = await StudentStats.find({ user: { $in: studentIds } }, 'level xp');
  const levelBands = [
    { label: 'Lv. 1–5', min: 1, max: 5, count: 0 },
    { label: 'Lv. 6–10', min: 6, max: 10, count: 0 },
    { label: 'Lv. 11–20', min: 11, max: 20, count: 0 },
    { label: 'Lv. 21+', min: 21, max: Infinity, count: 0 },
  ];
  allStats.forEach((s) => {
    const band = levelBands.find((b) => s.level >= b.min && s.level <= b.max);
    if (band) band.count++;
  });

  // 3. Skill tier distribution
  const tierCounts = { UNVERIFIED: 0, BASIC: 0, INTERMEDIATE: 0, MASTER: 0 };
  const technologyFrequency = {};

  const allStatsWithSkills = await StudentStats.find({ user: { $in: studentIds } }, 'skills');
  allStatsWithSkills.forEach((s) => {
    s.skills.forEach((skill) => {
      tierCounts[skill.tier] = (tierCounts[skill.tier] || 0) + 1;
      if (skill.type === 'TECHNOLOGY') {
        technologyFrequency[skill.name] = (technologyFrequency[skill.name] || 0) + 1;
      }
    });
  });

  // Sort technologies by frequency, take top 8
  const topTechnologies = Object.entries(technologyFrequency)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  // 4. Average AI score per milestone index
  const milestoneIndexScores = await Promise.all(
    [1, 2, 3, 4, 5].map(async (index) => {
      const completedWithScore = await Milestone.find({
        project: { $in: projectIds },
        index,
        status: 'COMPLETED',
        aiScore: { $ne: null },
      });
      const avg = completedWithScore.length > 0
        ? Math.round(completedWithScore.reduce((sum, m) => sum + m.aiScore, 0) / completedWithScore.length)
        : 0;
      return { milestone: `M${index}`, avgScore: avg, count: completedWithScore.length };
    })
  );

  // 5. Projects by status
  const projectStatusCounts = await Promise.all(
    ['PLANNING', 'IN_PROGRESS', 'COMPLETED'].map(async (status) => ({
      status,
      count: await Project.countDocuments({ student: { $in: studentIds }, status }),
    }))
  );

  // 6. Average cohort level
  const avgLevel = allStats.length > 0
    ? Math.round(allStats.reduce((sum, s) => sum + s.level, 0) / allStats.length * 10) / 10
    : 0;

  res.status(200).json({
    status: 'success',
    data: {
      milestoneStatusBreakdown: milestoneStatusCounts,
      levelDistribution: levelBands,
      tierDistribution: Object.entries(tierCounts).map(([tier, count]) => ({ tier, count })),
      topTechnologies,
      milestoneScoresByIndex: milestoneIndexScores,
      projectStatusBreakdown: projectStatusCounts,
      avgCohortLevel: avgLevel,
      totalStudents: allStats.length,
    },
  });
});

const getMasterSkills = asyncHandler(async (req, res) => {
  const skills = await MasterSkill.find().sort({ name: 1 });
  res.status(200).json({
    status: 'success',
    data: { skills },
  });
});

const getStudentByUsername = asyncHandler(async (req, res) => {
  const { username } = req.params;
  const user = await User.findOne({ username: username.toLowerCase() });
  if (!user) {
    throw new NotFoundError('User with this username not found');
  }
  res.status(200).json({
    status: 'success',
    data: {
      userId: user._id,
      role: user.role,
      name: user.name,
    },
  });
});

module.exports = {
  getStudentDashboard,
  getMasterSkills,
  getLeaderboard,
  getMySkills,
  addSkill,
  deleteSkill,
  getMyBadges,
  getAIInsights,
  getStaffDashboard,
  getStudentProfile,
  generateSkillQuestions,
  submitSkillTestResult,
  getStudentByUsername,
  // Instructor endpoints
  getAllStudents,
  getStudentDetailedProfile,
  getCohortAnalytics,
};

