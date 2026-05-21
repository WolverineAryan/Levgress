const Project = require("../models/Project");
const ProjectMilestone = require("../models/ProjectMilestone");
const StudentStats = require("../models/StudentStats");
const User = require("../models/User");
const XpHistory = require("../models/XpHistory");

/* ===============================
   DEFAULT MILESTONES
================================ */
const DEFAULT_MILESTONES = [
  "Idea / Planning",
  "UI / Design",
  "Development",
  "Testing",
  "Deployment"
];

/* ===============================
   CREATE PROJECT (AUTO MILESTONES)
================================ */
exports.createProject = async (req, res) => {
  try {
    const project = await Project.create({
      studentId: req.user._id,
      ...req.body,
      status: "IN_PROGRESS"
    });

    // 🔥 ALWAYS CREATE 5 MILESTONES
    await ProjectMilestone.insertMany(
      DEFAULT_MILESTONES.map((title) => ({
        projectId: project._id,
        title,
        status: "PENDING",
        isValidated: false
      }))
    );

    res.status(201).json(project);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ===============================
   GET MY PROJECTS
================================ */
exports.getMyProjects = async (req, res) => {
  try {
    const projects = await Project.find({ studentId: req.user._id });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ===============================
   GET STUDENT PROJECTS (STAFF)
================================ */
exports.getStudentProjects = async (req, res) => {
  try {
    const projects = await Project.find({ studentId: req.params.id });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ===============================
   UPDATE PROJECT DETAILS
================================ */
exports.updateProject = async (req, res) => {
  try {
    const allowedFields = [
      "title",
      "description",
      "liveUrl",
      "githubUrl",
      "domain",
      "techStack"
    ];

    const updateData = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    const project = await Project.findOneAndUpdate(
      { _id: req.params.projectId, studentId: req.user._id },
      updateData,
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
    res.status(500).json({ message: err.message });
  }
};

/* ===============================
   UPLOAD PROJECT IMAGES
================================ */
exports.uploadProjectImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No images uploaded" });
    }

    const imagePaths = req.files.map((file) => file.path);

    const project = await Project.findByIdAndUpdate(
      req.params.projectId,
      {
        $push: { images: { $each: imagePaths } }
      },
      { new: true }
    );

    res.json({
      message: "Images uploaded",
      images: imagePaths,
      project
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ===============================
   GET PROJECT DETAILS
================================ */
exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const milestones = await ProjectMilestone.find({
      projectId: project._id
    }).sort({ createdAt: 1 });

    res.json({
      project,
      milestones
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ===============================
   PROJECT COMMENTS
================================ */
exports.addProjectComment = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const newComment = {
      user: req.user._id,
      text: req.body.text,
      createdAt: new Date()
    };

    project.comments.push(newComment);
    await project.save();

    const populated = await Project.findById(req.params.id).populate(
      "comments.user",
      "name"
    );

    const latest =
      populated.comments[populated.comments.length - 1];

    req.app.get("io").to(req.params.id).emit("new-comment", latest);

    res.json(latest);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ===============================
   GET COMMENTS
================================ */
exports.getProjectComments = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate(
      "comments.user",
      "name"
    );

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json(project.comments || []);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};