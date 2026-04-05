const ProjectMilestone = require("../models/ProjectMilestone");
const Project = require("../models/Project");
const User = require("../models/User");
const Badge = require("../models/Badge");
const XpHistory = require("../models/XpHistory");

/* ===============================
   ADD MILESTONE
================================ */

exports.addMilestone = async (req, res) => {

  try {

    const project = await Project.findById(req.params.projectId);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (project.studentId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const milestone = await ProjectMilestone.create({
      projectId: project._id,
      title: req.body.title
    });

    res.status(201).json(milestone);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }

};

/* ===============================
   GET PROJECT MILESTONES
================================ */

exports.getMilestones = async (req, res) => {

  try {

    const milestones = await ProjectMilestone.find({
      projectId: req.params.projectId
    }).sort({ createdAt: 1 });

    res.json(milestones);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }

};

/* ===============================
   COMPLETE MILESTONE
================================ */

exports.completeMilestone = async (req, res) => {

  try {

    const milestone = await ProjectMilestone.findById(req.params.id);

    if (!milestone) {
      return res.status(404).json({ message: "Milestone not found" });
    }

    const project = await Project.findById(milestone.projectId);

    if (project.studentId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    milestone.status = "COMPLETED";

    await milestone.save();

    /* ===== XP REWARD ===== */

    const student = await User.findById(req.user._id);

    student.xp = (student.xp || 0) + milestone.xpReward;

    student.level = Math.floor(student.xp / 100) + 1;

    await student.save();

    await XpHistory.create({
      studentId: student._id,
      xpChange: milestone.xpReward,
      totalXpAfter: student.xp,
      reason: "Milestone Completed"
    });

    /* ===== BADGE SYSTEM ===== */

    const completedCount = await ProjectMilestone.countDocuments({
      status: "COMPLETED",
      projectId: project._id
    });

    let badge = null;

    if (completedCount === 5) {
      badge = await Badge.create({
        userId: student._id,
        title: "Builder Badge",
        description: "Completed 5 milestones"
      });
    }

    if (completedCount === 10) {
      badge = await Badge.create({
        userId: student._id,
        title: "Architect Badge",
        description: "Completed 10 milestones"
      });
    }

    res.json({
      milestone,
      xp: student.xp,
      level: student.level,
      badge
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }

};