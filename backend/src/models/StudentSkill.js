const mongoose = require("mongoose");

const studentSkillSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  skillId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "MasterSkill",
    required: true
  },
  // skillId: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: "MasterSkill",
  //   required: true
  // },
  status: {
    type: String,
    enum: ["PLANNED", "IN_PROGRESS", "LEARNED"],
    default: "PLANNED"
  },

  level: {
    type: String,
    enum: ["BEGINNER", "INTERMEDIATE", "ADVANCED"],
    default: "BEGINNER"
  },

  evidenceUrl: String
}, { timestamps: true });

studentSkillSchema.index({ studentId: 1, skillId: 1 }, { unique: true });

module.exports = mongoose.model("StudentSkill", studentSkillSchema);
