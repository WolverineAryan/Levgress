const ProjectMilestone = require("../models/ProjectMilestone");

/* ADD MILESTONE */
exports.addMilestone = async (req, res) => {
  try {
    const milestone = await ProjectMilestone.create({
      projectId: req.params.projectId,
      title: req.body.title,
      description: req.body.description
    });

    res.status(201).json(milestone);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* GET PROJECT MILESTONES */
exports.getMilestones = async (req, res) => {
  const milestones = await ProjectMilestone.find({
    projectId: req.params.projectId
  });

  res.json(milestones);
};

/* COMPLETE MILESTONE (Student) */
exports.completeMilestone = async (req, res) => {
  const milestone = await ProjectMilestone.findByIdAndUpdate(
    req.params.id,
    { status: "COMPLETED" },
    { new: true }
  );

  res.json(milestone);
};

/* APPROVE MILESTONE (Staff) */
exports.approveMilestone = async (req, res) => {

  const milestone = await ProjectMilestone.findByIdAndUpdate(
    req.params.id,
    {
      status: "APPROVED",
      approvedBy: req.user._id,
      approvedAt: new Date()
    },
    { new: true }
  );

  res.json(milestone);
};

/* REJECT MILESTONE */
exports.rejectMilestone = async (req, res) => {

  const milestone = await ProjectMilestone.findByIdAndUpdate(
    req.params.id,
    { status: "REJECTED" },
    { new: true }
  );

  res.json(milestone);
};