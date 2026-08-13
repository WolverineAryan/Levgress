const Milestone = require('../models/Milestone');
const supabaseService = require('./supabase.service');
const Project = require('../models/Project');
const ActivityLog = require('../models/ActivityLog');
const aiEvaluationService = require('./aiEvaluation.service');
const gamificationService = require('./gamification.service');
const notificationService = require('./notification.service');
const socketConfig = require('../config/socket');
const { NotFoundError, ForbiddenError, ValidationError } = require('../utils/AppError');

const runBackgroundAIEvaluation = async (project, milestone, studentId) => {
  try {
    const evaluation = await aiEvaluationService.evaluateEvidence(
      project,
      milestone,
      milestone.evidence
    );

    milestone.aiScore = evaluation.score;
    milestone.aiFeedback = evaluation.feedback;

    const PASS_SCORE = 80;
    if (evaluation.score >= PASS_SCORE) {
      await completeMilestone(milestone, project, studentId, `AI Validation Passed (${evaluation.score}/100)`);
    } else {
      milestone.status = 'REJECTED';
      await milestone.save();

      await notificationService.createNotification(
        studentId,
        'MILESTONE_REJECTED',
        `Milestone ${milestone.index} of "${project.title}" was not approved by AI (Score: ${evaluation.score}/100).`,
        `/project/${project._id}`
      );
    }
  } catch (error) {
    console.error(`AI Evaluation failed for milestone ${milestone._id}:`, error);
    // On AI grader failure, keep status as SUBMITTED so staff can manually review.
    milestone.aiFeedback = 'AI auto-grading was temporarily unavailable. Waiting for instructor manual review.';
    await milestone.save();

    await notificationService.createNotification(
      studentId,
      'MILESTONE_AI_FAILED',
      `Milestone ${milestone.index} submitted but AI grading is currently unavailable. Your instructor will review it manually.`,
      `/project/${project._id}`
    );
  }

  // Notify frontend via sockets
  try {
    socketConfig.sendToUser(studentId.toString(), 'milestone-updated', {
      milestoneId: milestone._id,
      status: milestone.status,
      aiScore: milestone.aiScore,
      aiFeedback: milestone.aiFeedback,
    });
  } catch (socketErr) {
    console.error('Failed to emit socket update for milestone:', socketErr);
  }
};

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

  const { type, text, url, fileName, fileData, files } = evidenceData;

  // 1. URL Scheme validation
  if (url) {
    if (!url.startsWith('https://')) {
      throw new ValidationError('Evidence URLs must use the secure https:// scheme');
    }
  }

  // Helper to validate a base64 file
  const validateBase64File = (b64Data, fName) => {
    const matches = b64Data.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      throw new ValidationError('Invalid file data format. Expected Base64 data URL.');
    }
    const mimeType = matches[1];
    const base64String = matches[2];
    
    // Size check (max 5MB)
    const sizeInBytes = Math.ceil(base64String.length * 0.75);
    if (sizeInBytes > 5 * 1024 * 1024) {
      throw new ValidationError(`File "${fName}" exceeds the maximum 5MB size limit.`);
    }

    // MIME type check
    const allowedMimeTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/gif'];
    if (!allowedMimeTypes.includes(mimeType)) {
      throw new ValidationError(`File "${fName}" has an invalid type. Only PDF and images (PNG, JPG, GIF) are allowed.`);
    }
  };

  // 2. Validate main file
  if (fileData && fileData.startsWith('data:')) {
    validateBase64File(fileData, fileName || 'evidence');
  }

  // 3. Validate multiple files
  const fileList = files || [];
  if (fileList.length > 5) {
    throw new ValidationError('A maximum of 5 files can be uploaded per milestone submission.');
  }

  for (const f of fileList) {
    if (f.fileData && f.fileData.startsWith('data:')) {
      validateBase64File(f.fileData, f.fileName || 'attachment');
    }
  }

  // 4. Validate evidence type consistency
  if (type === 'LINK' && !url) {
    throw new ValidationError('A link URL is required when evidence type is LINK.');
  }
  if (type === 'PDF' && !fileData && !(fileName || '').toLowerCase().endsWith('.pdf')) {
    throw new ValidationError('A PDF file is required when evidence type is PDF.');
  }
  if (type === 'IMAGE' && !fileData && !['.png', '.jpg', '.jpeg', '.gif'].some(ext => (fileName || '').toLowerCase().endsWith(ext))) {
    throw new ValidationError('An image file is required when evidence type is IMAGE.');
  }

  let uploadedFileData = fileData || '';
  if (uploadedFileData && uploadedFileData.startsWith('data:')) {
    const publicUrl = await supabaseService.uploadBase64File(
      uploadedFileData,
      'levgress-assets',
      `milestones/${milestoneId}`,
      `evidence_${fileName.replace(/\s+/g, '_')}`
    );
    uploadedFileData = publicUrl;
  }

  let uploadedFiles = [];
  if (files && Array.isArray(files)) {
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      let fData = f.fileData || '';
      if (fData && fData.startsWith('data:')) {
        const publicUrl = await supabaseService.uploadBase64File(
          fData,
          'levgress-assets',
          `milestones/${milestoneId}`,
          `evidence_${i}_${f.fileName.replace(/\s+/g, '_')}`
        );
          fData = publicUrl;
      }
      uploadedFiles.push({
        fileName: f.fileName,
        fileData: fData
      });
    }
  }

  // Update milestone status to SUBMITTED
  milestone.status = 'SUBMITTED';
  milestone.evidence = {
    type: type || 'TEXT',
    text: text || '',
    url: url || '',
    fileName: fileName || '',
    fileData: uploadedFileData,
    files: uploadedFiles,
    submittedAt: new Date(),
  };
  await milestone.save();

  // Log activity
  await ActivityLog.create({
    student: studentId,
    activityType: 'MILESTONE_SUBMIT',
    details: `Submitted ${type || 'TEXT'} evidence for Milestone ${milestone.index} on project "${project.title}"`,
  });

  // Decoupled background AI grading
  runBackgroundAIEvaluation(project, milestone, studentId).catch((err) => {
    console.error('Background AI evaluation initiation failed:', err);
  });

  return milestone;
};

const completeMilestone = async (milestone, project, studentId, reason) => {
  // 1. Core updates
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
    const skillXpReward = Math.ceil(50 / project.techStack.length);
    for (const skillName of project.techStack) {
      await gamificationService.updateSkillXP(studentId, skillName, 'Other', skillXpReward);
    }
  }

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
  }

  // 2. Secondary/Non-critical updates (failures shouldn't halt milestone completion)
  try {
    await ActivityLog.create({
      student: studentId,
      activityType: 'MILESTONE_COMPLETE',
      details: `Completed Milestone ${milestone.index} of "${project.title}" - ${reason}`,
    });

    await notificationService.createNotification(
      studentId,
      'MILESTONE_VERIFIED',
      `Milestone ${milestone.index} of "${project.title}" is verified! (+${xpReward} XP)`,
      `/project/${project._id}`
    );

    if (milestone.index === 5) {
      const completedProjectsCount = await Project.countDocuments({
        student: studentId,
        status: 'COMPLETED',
      });
      await gamificationService.checkAndAwardBadges(studentId, 'PROJECT_COUNT', completedProjectsCount);
    }

    if (milestone.aiScore && milestone.aiScore >= 95) {
      await gamificationService.checkAndAwardBadges(studentId, 'BUG_HUNTER', milestone.aiScore);
    }
  } catch (err) {
    console.error(`Failed to execute milestone complete side effects for ${milestone._id}:`, err);
  }
};

// Staff Action: Approve milestone manually (override AI)
const staffApproveMilestone = async (milestoneId, staffId, feedback = '') => {
  const milestone = await Milestone.findById(milestoneId);
  if (!milestone) {
    throw new NotFoundError('Milestone not found');
  }

  if (milestone.status !== 'SUBMITTED') {
    throw new ValidationError('Only SUBMITTED milestones can be manually approved.');
  }

  const project = await Project.findById(milestone.project);

  milestone.aiScore = 100; // Manual approval sets score to 100
  milestone.aiFeedback = feedback || 'Manually approved by Instructor.';
  milestone.approvedBy = staffId;
  milestone.rejectedBy = null; // Clear rejected status if approved later

  await completeMilestone(milestone, project, project.student, `Instructor Manual Approval`);

  return milestone;
};

// Staff Action: Reject milestone manually
const staffRejectMilestone = async (milestoneId, staffId, feedback = '') => {
  const milestone = await Milestone.findById(milestoneId);
  if (!milestone) {
    throw new NotFoundError('Milestone not found');
  }

  if (milestone.status !== 'SUBMITTED') {
    throw new ValidationError('Only SUBMITTED milestones can be manually rejected.');
  }

  const project = await Project.findById(milestone.project);

  milestone.status = 'REJECTED';
  milestone.aiScore = 0;
  milestone.aiFeedback = feedback || 'Rejected by Instructor. Please review and resubmit.';
  milestone.rejectedBy = staffId;
  milestone.approvedBy = null; // Clear approved status if rejected later
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
