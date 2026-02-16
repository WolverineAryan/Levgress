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
      req.params.id,
      { status: "COMPLETED" },
      { returnDocument: "after" }
    );

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Real-time emit
    req.app.get("io").emit("project-updated", {
      projectId: project._id,
      status: "COMPLETED"
    });

    res.json(project);

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
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

exports.getProjectComments = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("comments.user", "name");

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json(project.comments || []);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.addComment = async (req, res) => {
  const project = await Project.findById(req.params.id)
    .populate("comments.user", "name");

  const comment = {
    user: req.user.id,
    text: req.body.text,
    createdAt: new Date()
  };

  project.comments.push(comment);
  await project.save();

  const newComment = project.comments[project.comments.length - 1];

  // Emit real-time event
  req.app.get("io")
    .to(req.params.id)
    .emit("new-comment", newComment);

  res.json(newComment);
};

exports.addProjectComment = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const newComment = {
      user: req.user.id,
      text: req.body.text,
      createdAt: new Date()
    };

    project.comments.push(newComment);
    await project.save();

    const populatedProject = await Project.findById(req.params.id)
      .populate("comments.user", "name");

    const latestComment =
      populatedProject.comments[populatedProject.comments.length - 1];

    // Real-time emit
    req.app.get("io")
      .to(req.params.id)
      .emit("new-comment", latestComment);

    res.json(latestComment);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
