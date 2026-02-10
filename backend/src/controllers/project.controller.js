const Project = require("../models/Project");
const ProjectMilestone = require("../models/ProjectMilestone");
const StudentStats = require("../models/StudentStats");

// Create project (Student)
exports.createProject = async (req, res) => {
  try {
    const project = await Project.create({
      studentId: req.user._id,
      ...req.body
    });

    await StudentStats.findOneAndUpdate(
      { studentId: req.user._id },
      { lastActivityAt: new Date() }
    );

    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ message: "Failed to create project" });
  }
  eventBus.emit(EVENTS.PROJECT_CREATED, {
  studentId: req.user._id
});

};

// Add milestone (Student)
exports.addMilestone = async (req, res) => {
  try {
    const milestone = await ProjectMilestone.create({
      projectId: req.params.projectId,
      ...req.body
    });
    res.status(201).json(milestone);
  } catch (err) {
    res.status(500).json({ message: "Failed to add milestone" });
  }
};

// Approve milestone (Staff)
exports.approveMilestone = async (req, res) => {
  try {
    const milestone = await ProjectMilestone.findByIdAndUpdate(
      req.params.id,
      {
        isApproved: true,
        approvedBy: req.user._id,
        approvedAt: new Date()
      },
      { new: true }
    );

    res.json(milestone);
  } catch (err) {
    res.status(500).json({ message: "Failed to approve milestone" });
  }
  eventBus.emit(EVENTS.MILESTONE_APPROVED, {
  studentId: milestone.projectId.studentId
});

};

// Update project progress (Student)
exports.updateProgress = async (req, res) => {
  try {
    const project = await Project.findOneAndUpdate(
      { _id: req.params.projectId, studentId: req.user._id },
      req.body,
      { new: true }
    );

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    await StudentStats.findOneAndUpdate(
      { studentId: req.user._id },
      { lastActivityAt: new Date() }
    );

    res.json(project);
  } catch (err) {
    res.status(500).json({ message: "Failed to update project" });
  }
};

// Complete project (Staff)
exports.completeProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.projectId,
      {
        isCompleted: true,
        phase: "COMPLETED",
        completedAt: new Date()
      },
      { new: true }
    );

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    await StudentStats.findOneAndUpdate(
      { studentId: project.studentId },
      {
        $inc: { completedProjectsCount: 1 },
        lastActivityAt: new Date()
      }
    );

    res.json(project);
  } catch (err) {
    res.status(500).json({ message: "Failed to complete project" });
  }
  eventBus.emit(EVENTS.PROJECT_COMPLETED, {
  studentId: project.studentId
});

};

// Get my projects (Student)
exports.getMyProjects = async (req, res) => {
  const projects = await Project.find({ studentId: req.user._id });
  res.json(projects);
};

// Get student projects (Staff / Peer)
exports.getStudentProjects = async (req, res) => {
  const projects = await Project.find({ studentId: req.params.id });
  res.json(projects);
};
