const StudentSkill = require("../models/StudentSkill");
const StudentStats = require("../models/StudentStats");
const eventBus = require("../events/dispatcher");
const EVENTS = require("../events/constants");
const MasterSkill = require("../models/MasterSkill");

// Add skill to student
exports.addSkill = async (req, res) => {
  try {
    const { skillId, level } = req.body;

    const skill = await Skill.findById(skillId);
    if (!skill) {
      return res.status(404).json({ message: "Skill not found" });
    }

    const studentSkill = await StudentSkill.create({
      studentId: req.user._id,
      skillId,
      level
    });

    await StudentStats.findOneAndUpdate(
      { studentId: req.user._id },
      { lastActivityAt: new Date() }
    );

    res.status(201).json(studentSkill);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "Skill already added" });
    }
    res.status(500).json({ message: "Failed to add skill" });
  }
};

// Update skill status or level
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

    // If marked as LEARNED, increment stats once
    if (status === "LEARNED") {
      await StudentStats.findOneAndUpdate(
        { studentId: req.user._id },
        {
          $inc: { learnedSkillsCount: 1 },
          lastActivityAt: new Date()
        }
      );
    }
    if (status === "LEARNED") {
    eventBus.emit(EVENTS.SKILL_LEARNED, {
        studentId: req.user._id
    });
    }


    res.json(studentSkill);
  } catch (err) {
    res.status(500).json({ message: "Failed to update skill" });
  }
};

// Get my skills
exports.getMySkills = async (req, res) => {
  const skills = await StudentSkill.find({ studentId: req.user._id })
    .populate("skillId");
  res.json(skills);
};

// Get public skills of a student (peer/staff view)
exports.getStudentSkills = async (req, res) => {
  const skills = await StudentSkill.find({ studentId: req.params.id })
    .populate("skillId");
  res.json(skills);
};

// Get master skills
exports.getMasterSkills = async (req, res) => {
  try {
    const skills = await MasterSkill.find().sort({ name: 1 });
    res.json(skills);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
