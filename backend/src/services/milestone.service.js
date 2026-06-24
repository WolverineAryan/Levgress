const Milestone = require('../models/Milestone');
const Project = require('../models/Project');
const ActivityLog = require('../models/ActivityLog');
const aiEvaluationService = require('./aiEvaluation.service');
const gamificationService = require('./gamification.service');
const notificationService = require('./notification.service');
const { NotFoundError, ForbiddenError, ValidationError } = require('../utils/AppError');

const submitEvidence = async (milestoneId, studentId, evidenceData) => {
  const milestone = await Milestone.findById(milestoneId);
  if (!milestone) {
    throw new NotFoundError('Milestone not found');
  }

  const project = await Project.findById(milestone.project);
  if (project.student.toString() !== studentId.toString()) {
    throw new ForbiddenError('You can only submit evidence for your own projects');
  }

  if (milestone.status === 'LOCKED') {
    throw new ValidationError('This milestone is locked. Complete previous milestones first.');
  }

  const { type, text, url, fileName, fileData } = evidenceData;

  // Update milestone status to SUBMITTED
  milestone.status = 'SUBMITTED';
  milestone.evidence = {
    type: type || 'TEXT',
    text: text || '',
    url: url || '',
    fileName: fileName || '',
    fileData: fileData || '',
    submittedAt: new Date(),
  };
  await milestone.save();

  // Log activity
  await ActivityLog.create({
    student: studentId,
    activityType: 'MILESTONE_SUBMIT',
    details: `Submitted ${type || 'TEXT'} evidence for Milestone ${milestone.index} on project "${project.title}"`,
  });

  // Trigger AI evaluation asynchronously (or synchronously for user feedback)
  const evaluation = await aiEvaluationService.evaluateEvidence(
    project,
    milestone,
    milestone.evidence
  );

  milestone.aiScore = evaluation.score;
  milestone.aiFeedback = evaluation.feedback;

  const PASS_SCORE = 80;
  if (evaluation.score >= PASS_SCORE) {
    // Complete milestone
    await completeMilestone(milestone, project, studentId, `AI Validation Passed (${evaluation.score}/100)`);
  } else {
    // Reject milestone
    milestone.status = 'REJECTED';
    await milestone.save();

    await notificationService.createNotification(
      studentId,
      'MILESTONE_REJECTED',
      `Milestone ${milestone.index} of "${project.title}" was not approved by AI (Score: ${evaluation.score}/100).`,
      `/project/${project._id}`
    );
  }

  return milestone;
};

const completeMilestone = async (milestone, project, studentId, reason) => {
  milestone.status = 'COMPLETED';
  milestone.completedAt = new Date();
  await milestone.save();

  // Update project status if this is the first milestone
  if (milestone.index === 1 && project.status === 'PLANNING') {
    project.status = 'IN_PROGRESS';
    await project.save();
  }

  // Award XP (100 XP per milestone)
  const xpReward = 100;
  await gamificationService.awardXP(studentId, xpReward, `Completed Milestone ${milestone.index}: ${milestone.title}`);

  // Award skill XP if project has tech stack
  if (project.techStack && project.techStack.length > 0) {
    // Distribute 50 XP across project tech stack skills
    const skillXpReward = Math.ceil(50 / project.techStack.length);
    for (const skillName of project.techStack) {
      await gamificationService.updateSkillXP(studentId, skillName, 'Other', skillXpReward);
    }
  }

  // Log completion activity
  await ActivityLog.create({
    student: studentId,
    activityType: 'MILESTONE_COMPLETE',
    details: `Completed Milestone ${milestone.index} of "${project.title}" - ${reason}`,
  });

  // Notify student
  await notificationService.createNotification(
    studentId,
    'MILESTONE_VERIFIED',
    `Milestone ${milestone.index} of "${project.title}" is verified! (+${xpReward} XP)`,
    `/project/${project._id}`
  );

  // Unlock next milestone if there is one
  if (milestone.index < 5) {
    await Milestone.findOneAndUpdate(
      { project: project._id, index: milestone.index + 1 },
      { status: 'ACTIVE' }
    );
  } else {
    // Index is 5 -> Complete project
    project.status = 'COMPLETED';
    await project.save();

    // Bonus XP for project completion (250 XP)
    const completionBonus = 250;
    await gamificationService.awardXP(studentId, completionBonus, `Completed Project: ${project.title}`);

    // Check project count badges
    const completedProjectsCount = await Project.countDocuments({
      student: studentId,
      status: 'COMPLETED',
    });
    await gamificationService.checkAndAwardBadges(studentId, 'PROJECT_COUNT', completedProjectsCount);
  }
};

// Staff Action: Approve milestone manually (override AI)
const staffApproveMilestone = async (milestoneId, staffId, feedback = '') => {
  const milestone = await Milestone.findById(milestoneId);
  if (!milestone) {
    throw new NotFoundError('Milestone not found');
  }

  const project = await Project.findById(milestone.project);

  milestone.aiScore = 100; // Manual approval sets score to 100
  milestone.aiFeedback = feedback || 'Manually approved by Instructor.';

  await completeMilestone(milestone, project, project.student, `Instructor Manual Approval`);

  return milestone;
};

// Staff Action: Reject milestone manually
const staffRejectMilestone = async (milestoneId, staffId, feedback = '') => {
  const milestone = await Milestone.findById(milestoneId);
  if (!milestone) {
    throw new NotFoundError('Milestone not found');
  }

  const project = await Project.findById(milestone.project);

  milestone.status = 'REJECTED';
  milestone.aiScore = 0;
  milestone.aiFeedback = feedback || 'Rejected by Instructor. Please review and resubmit.';
  await milestone.save();

  await notificationService.createNotification(
    project.student,
    'MILESTONE_REJECTED',
    `Milestone ${milestone.index} of "${project.title}" was rejected by Instructor.`,
    `/project/${project._id}`
  );

  return milestone;
};

module.exports = {
  submitEvidence,
  staffApproveMilestone,
  staffRejectMilestone,
};
