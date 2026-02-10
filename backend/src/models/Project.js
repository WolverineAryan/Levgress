const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  title: {
    type: String,
    required: true
  },

  description: String,

  domain: {
    type: String
  },

  techStack: [String],

  phase: {
    type: String,
    enum: ["PLANNING", "DEVELOPMENT", "TESTING", "COMPLETED"],
    default: "PLANNING"
  },

  progressPercent: {
    type: Number,
    default: 0
  },

  mentorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  isCompleted: {
    type: Boolean,
    default: false
  },

  completedAt: Date
}, { timestamps: true });

module.exports = mongoose.model("Project", projectSchema);
