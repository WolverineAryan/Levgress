const mongoose = require("mongoose");

const studentStatsSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    unique: true,
    required: true
  },

  level: {
    type: Number,
    default: 1
  },

  currentXP: {
    type: Number,
    default: 0
  },

  lifetimeXP: {
    type: Number,
    default: 0
  },

  learnedSkillsCount: {
    type: Number,
    default: 0
  },

  completedProjectsCount: {
    type: Number,
    default: 0
  },

  lastActivityAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model("StudentStats", studentStatsSchema);
