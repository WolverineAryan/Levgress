const ProjectMilestone = require("../models/ProjectMilestone");
const Project = require("../models/Project");
const User = require("../models/User");
const XpHistory = require("../models/XpHistory");

/* ===============================
   GET MILESTONES
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
   UPLOAD EVIDENCE (CORE LOGIC)
================================ */
exports.uploadEvidence = async (req, res) => {
  try {
    const milestone = await ProjectMilestone.findById(req.params.id);

    if (!milestone) {
      return res.status(404).json({ message: "Milestone not found" });
    }

    if (milestone.isValidated) {
      return res.status(400).json({ message: "Already completed" });
    }

    const evidenceUrl = req.body.evidenceUrl;
    const file = req.file;

    // ---------------- INPUT VALIDATION ----------------
    if (!file && !evidenceUrl) {
      return res.status(400).json({
        message: "Provide file or URL"
      });
    }

    // ---------------- TYPE DETECTION ----------------
    let type = "unknown";

    if (file) {
      type = "image";
    } else if (evidenceUrl.includes("github.com")) {
      type = "github";
    } else {
      type = "live";
    }

    // ---------------- RULE VALIDATION ----------------
    const m = milestone.title;

    if (m === "Development" && type !== "github") {
      return res.status(400).json({
        message: "Development requires GitHub repo"
      });
    }

    if (m === "Deployment" && type !== "live") {
      return res.status(400).json({
        message: "Deployment requires live URL"
      });
    }

    if (m === "UI / Design" && type !== "image") {
      return res.status(400).json({
        message: "UI/Design requires image proof"
      });
    }

    // ---------------- SAVE EVIDENCE ----------------
    milestone.status = "COMPLETED";
    milestone.isValidated = true;
    milestone.evidenceUrl = evidenceUrl || null;
    milestone.filePath = file?.path || null;

    await milestone.save();

    // ---------------- PROJECT COMPLETION CHECK ----------------
    const total = await ProjectMilestone.countDocuments({
      projectId: milestone.projectId
    });

    const completed = await ProjectMilestone.countDocuments({
      projectId: milestone.projectId,
      status: "COMPLETED"
    });

    let projectCompleted = false;
    let xp = null;
    let level = null;

    if (total === completed) {
      projectCompleted = true;

      await Project.findByIdAndUpdate(milestone.projectId, {
        status: "COMPLETED"
      });

      const user = await User.findById(req.user._id);

      user.xp = (user.xp || 0) + 50;
      user.level = Math.floor(user.xp / 100) + 1;

      await user.save();

      xp = user.xp;
      level = user.level;

      await XpHistory.create({
        studentId: user._id,
        xpChange: 50,
        totalXpAfter: user.xp,
        reason: "Project Completed"
      });
    }

    // ---------------- RESPONSE ----------------
    return res.json({
      success: true,
      message: "Milestone validated",
      milestone,
      projectCompleted,
      xp,
      level
    });

  } catch (err) {
    console.error("UPLOAD ERROR:", err);

    res.status(500).json({
      message: "Server error",
      error: err.message
    });
  }
};