const StudentSkill = require("../models/StudentSkill");
const StudentStats = require("../models/StudentStats");
const MasterSkill = require("../models/MasterSkill");
const eventBus = require("../events/dispatcher");
const EVENTS = require("../events/constants");

/* ===============================
   ADD SKILL (Student)
================================ */
exports.addSkill = async (req, res) => {
  try {
    const { skillId, level } = req.body;

    // Validate master skill exists
    const masterSkill = await MasterSkill.findById(skillId);
    if (!masterSkill) {
      return res.status(404).json({ message: "Skill not found" });
    }

    // Prevent duplicate skill
    const existing = await StudentSkill.findOne({
      studentId: req.user._id,
      skillId,
    });

    if (existing) {
      return res.status(400).json({ message: "Skill already added" });
    }

    const studentSkill = await StudentSkill.create({
      studentId: req.user._id,
      skillId,
      level,
      status: "IN_PROGRESS",
    });

    await StudentStats.findOneAndUpdate(
      { studentId: req.user._id },
      { lastActivityAt: new Date() }
    );

    res.status(201).json(studentSkill);

  } catch (err) {
    console.error("ADD SKILL ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

/* ===============================
   UPDATE SKILL
================================ */
exports.updateSkill = async (req, res) => {
  try {
    const { status, level, evidenceUrl } = req.body;

    const studentSkill = await StudentSkill.findOneAndUpdate(
      { _id: req.params.id, studentId: req.user._id },
      { status, level, evidenceUrl },
      { new: true }
    );

    if (!studentSkill) {
      return res.status(404).json({ message: "Skill not found" });
    }

    if (status === "LEARNED") {
      await StudentStats.findOneAndUpdate(
        { studentId: req.user._id },
        {
          $inc: { learnedSkillsCount: 1 },
          lastActivityAt: new Date(),
        }
      );

      eventBus.emit(EVENTS.SKILL_LEARNED, {
        studentId: req.user._id,
      });
    }

    res.json(studentSkill);

  } catch (err) {
    console.error("UPDATE SKILL ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

/* ===============================
   GET MY SKILLS
================================ */
exports.getMySkills = async (req, res) => {
  try {
    const skills = await StudentSkill.find({
      studentId: req.user._id,
    }).populate("skillId");

    res.json(skills);

  } catch (err) {
    console.error("GET MY SKILLS ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

/* ===============================
   GET STUDENT SKILLS
================================ */
exports.getStudentSkills = async (req, res) => {
  try {
    const skills = await StudentSkill.find({
      studentId: req.params.id,
    }).populate("skillId");

    res.json(skills);

  } catch (err) {
    console.error("GET STUDENT SKILLS ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

/* ===============================
   GET MASTER SKILLS
================================ */
exports.getMasterSkills = async (req, res) => {
  try {
    const skills = await MasterSkill.find().sort({ name: 1 });
    res.json(skills);

  } catch (err) {
    console.error("GET MASTER SKILLS ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};