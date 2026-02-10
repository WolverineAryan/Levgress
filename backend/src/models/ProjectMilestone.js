const mongoose = require("mongoose");

const milestoneSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    required: true
  },

  title: {
    type: String,
    required: true
  },

  description: String,

  isApproved: {
    type: Boolean,
    default: false
  },

  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  approvedAt: Date
}, { timestamps: true });

module.exports = mongoose.model("ProjectMilestone", milestoneSchema);
