
const ProjectMilestone = require("../models/ProjectMilestone");
const Project = require("../models/Project");
const User = require("../models/User");
const Badge = require("../models/Badge");
const XpHistory = require("../models/XpHistory");
const { evaluateEvidence } = require("../services/aiEvaluation.service");
const ValidationLog = require("../models/validationLog.model");

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
    UPLOAD EVIDENCE
================================ */
// let evidence;
// if (req.file) {
//   evidence = {
//     type: "image", // or detect from mimetype
//     value: req.file.path
//   };
// } else {
//   evidence = req.body.evidence;
// }
// -----------------------------
// HELPER: Detect Evidence Type
// -----------------------------
function detectType(url) {
  if (!url) return "unknown";

  if (url.includes("github.com")) return "github";
  if (url.includes("figma.com")) return "image";
  if (url.includes("vercel.app") || url.includes("netlify.app"))
    return "live";

  return "live";
}

// -----------------------------
// MAIN CONTROLLER
// -----------------------------
exports.uploadEvidence = async (req, res) => {
  try {
    const { evidenceUrl } = req.body;

    if (!evidenceUrl) {
      return res.status(400).json({
        message: "Evidence URL is required"
      });
    }

    const milestone = await ProjectMilestone.findById(req.params.id);

    if (!milestone) {
      return res.status(404).json({
        message: "Milestone not found"
      });
    }

    // Prevent duplicate submission
    if (milestone.isValidated) {
      return res.status(400).json({
        message: "Milestone already completed"
      });
    }

    // Detect type
    const type = detectType(evidenceUrl);

    // AI Evaluation
    const result = await evaluateEvidence({
      type,
      url: evidenceUrl,
      milestone: milestone.title
    });

    // Save log
    await ValidationLog.create({
      studentId: req.user._id,
      projectId: milestone.projectId,
      type,
      score: result.score,
      verdict: result.verdict,
      feedback: result.feedback,
      confidence: result.confidence
    });

    // HANDLE RESULT
    if (result.verdict === "PASS") {
      milestone.status = "COMPLETED";
      milestone.isValidated = true;
      milestone.evidenceUrl = null;

      await milestone.save();

      // ✅ CHECK PROJECT COMPLETION
      const total = await ProjectMilestone.countDocuments({
        projectId: milestone.projectId
      });

      const completed = await ProjectMilestone.countDocuments({
        projectId: milestone.projectId,
        status: "COMPLETED"
      });

      let projectCompleted = false;

      if (total === completed) {
        await Project.findByIdAndUpdate(milestone.projectId, {
          status: "COMPLETED"
        });

        projectCompleted = true;

        // ✅ ADD XP HERE (CORRECT PLACE)
        const student = await User.findById(req.user._id);

        student.xp = (student.xp || 0) + 50;
        student.level = Math.floor(student.xp / 100) + 1;

        await student.save();

        await XpHistory.create({
          studentId: student._id,
          xpChange: 50,
          totalXpAfter: student.xp,
          reason: "Project Completed"
        });
      }

      //  REAL-TIME EVENT
      if (global.io) {
        global.io.emit("milestone-completed", {
          milestoneId: milestone._id,
          projectId: milestone.projectId
        });
      }

      return res.json({
        success: true,
        message: "Milestone validated successfully",
        milestone,
        projectCompleted,
        result
      });
    }

    // FAIL CASE
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      feedback: result.feedback,
      score: result.score
    });

  } catch (err) {
    console.error("UPLOAD EVIDENCE ERROR:", err);

    res.status(500).json({
      message: "Server error during validation",
      error: err.message
    });
  }
};
