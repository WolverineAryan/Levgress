const Project = require("../models/Project");
const ProjectMilestone = require("../models/ProjectMilestone");
const StudentStats = require("../models/StudentStats");
const User = require("../models/User");
const Badge = require("../models/Badge");
const XpHistory = require("../models/XpHistory");
const updateStreak = require("../utils/updateStreak");

/* ===============================
   CREATE PROJECT (Student)
================================ */
exports.createProject = async (req, res) => {
  try {
    const project = await Project.create({
      studentId: req.user._id,
      ...req.body,
    });

    await StudentStats.findOneAndUpdate(
      { studentId: req.user._id },
      { lastActivityAt: new Date() }
    );

    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ message: "Failed to create project" });
  }
};

/* ===============================
   ADD MILESTONE (Student)
================================ */
exports.addMilestone = async (req, res) => {
  try {
    const milestone = await ProjectMilestone.create({
      projectId: req.params.projectId,
      ...req.body,
    });

    res.status(201).json(milestone);
  } catch (err) {
    res.status(500).json({ message: "Failed to add milestone" });
  }
};

/* ===============================
   APPROVE MILESTONE (Staff)
================================ */
exports.approveMilestone = async (req, res) => {
  try {
    const milestone = await ProjectMilestone.findByIdAndUpdate(
      req.params.id,
      {
        isApproved: true,
        approvedBy: req.user._id,
        approvedAt: new Date(),
      },
      { new: true }
    );

    if (!milestone) {
      return res.status(404).json({ message: "Milestone not found" });
    }

    res.json(milestone);
  } catch (err) {
    res.status(500).json({ message: "Failed to approve milestone" });
  }
};

/* ===============================
   UPDATE PROJECT PROGRESS (Student)
================================ */
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

/* ===============================
   COMPLETE PROJECT (Staff)
   + XP + LEVEL + STREAK + BADGE
================================ */
exports.completeProject = async (req, res) => {
  try {
    const io = req.app.get("io");

    // 1️⃣ Mark project completed
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { status: "COMPLETED" },
      { returnDocument: "after" }
    );

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // 2️⃣ Fetch student
    const student = await User.findById(project.studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const previousLevel = student.level || 1;

    // 3️⃣ Base XP
    student.xp = (student.xp || 0) + 50;
    student.level = Math.floor(student.xp / 100) + 1;

    await student.save();

    // 4️⃣ Level Badge Mapping
    const levelBadges = {
      5: "Level 5 Achiever",
      10: "Level 10 Master",
      20: "Elite Performer",
    };

    if (student.level > previousLevel && levelBadges[student.level]) {
      const existing = await Badge.findOne({
        userId: student._id,
        title: levelBadges[student.level],
      });

      if (!existing) {
        await Badge.create({
          userId: student._id,
          title: levelBadges[student.level],
          description: `Reached Level ${student.level}`,
        });

        io.to(student._id.toString()).emit("badge-earned");
      }
    }

    // 5️⃣ XP History (Base XP)
    await XpHistory.create({
      studentId: student._id,
      xpChange: 50,
      totalXpAfter: student.xp,
      reason: "Project Approved",
    });

    // 🔥 6️⃣ Update Streak (Includes Bonus XP + Badge)
    const streakData = await updateStreak(student._id);

    if (streakData) {
      io.to(student._id.toString()).emit("streak-update", streakData);

      // If streak bonus gave XP → refresh dashboard
      if (streakData.bonusXP > 0) {
        io.to(student._id.toString()).emit("level-up");
      }

      // If streak badge awarded
      if (streakData.badgeAwarded) {
        io.to(student._id.toString()).emit("badge-earned");
      }
    }

    // 7️⃣ Notify project update
    io.emit("project-updated", {
      projectId: project._id,
      status: "COMPLETED",
    });

    res.json({
      message: "Project completed. XP, level & streak updated.",
      project,
      newLevel: student.level,
      xp: student.xp,
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
};

/* ===============================
   GET MY PROJECTS (Student)
================================ */
exports.getMyProjects = async (req, res) => {
  const projects = await Project.find({ studentId: req.user._id });
  res.json(projects);
};

/* ===============================
   GET STUDENT PROJECTS (Staff)
================================ */
exports.getStudentProjects = async (req, res) => {
  const projects = await Project.find({ studentId: req.params.id });
  res.json(projects);
};

/* ===============================
   GET PROJECT COMMENTS
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
    res.status(500).json({ message: "Server error" });
  }
};

/* ===============================
   STREAK RECOVERY (Student)
================================ */
exports.recoverStreak = async (req, res) => {
  try {
    const studentId = req.user._id;
    const io = req.app.get("io");

    const stats = await StudentStats.findOne({ studentId });
    const user = await User.findById(studentId);

    if (!stats.recoveryAvailable) {
      return res.status(400).json({ message: "Recovery not available" });
    }

    if (user.xp < 30) {
      return res.status(400).json({ message: "Not enough XP" });
    }

    // Deduct XP
    user.xp -= 30;
    user.level = Math.floor(user.xp / 100) + 1;
    await user.save();

    await XpHistory.create({
      studentId,
      xpChange: -30,
      totalXpAfter: user.xp,
      reason: "Streak Recovery",
    });

    // Restore streak
    stats.currentStreak = stats.previousStreak;
    stats.recoveryAvailable = false;
    await stats.save();

    io.to(studentId.toString()).emit("streak-update", {
      currentStreak: stats.currentStreak,
      longestStreak: stats.longestStreak,
    });

    res.json({ message: "Streak recovered successfully" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ===============================
   ADD PROJECT COMMENT
================================ */
exports.addProjectComment = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const newComment = {
      user: req.user.id,
      text: req.body.text,
      createdAt: new Date(),
    };

    project.comments.push(newComment);
    await project.save();

    const populatedProject = await Project.findById(req.params.id).populate(
      "comments.user",
      "name"
    );

    const latestComment =
      populatedProject.comments[populatedProject.comments.length - 1];

    req.app.get("io").to(req.params.id).emit("new-comment", latestComment);

    res.json(latestComment);

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};