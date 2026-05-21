const User = require("../models/User");
const Project = require("../models/Project");
const ProjectMilestone = require("../models/ProjectMilestone");

exports.getDashboard = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    const projects = await Project.find({
      studentId: req.user._id
    });

    const completedProjects = projects.filter(
      (p) => p.status === "COMPLETED"
    ).length;

    const milestones = await ProjectMilestone.find({
      projectId: { $in: projects.map((p) => p._id) }
    });

    const completedMilestones = milestones.filter(
      (m) => m.status === "COMPLETED"
    ).length;

    const totalMilestones = milestones.length;

    res.json({
      xp: user.xp || 0,
      level: user.level || 1,
      nextLevelXP: ((user.level || 1) * 100),

      projects: projects.length,
      completedProjects,

      milestones: totalMilestones,
      completedMilestones
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};