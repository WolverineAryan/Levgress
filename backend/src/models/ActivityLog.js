const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  activityType: {
    type: String,
    enum: [
      "SKILL_LEARNED",
      "PROJECT_CREATED",
      "PROJECT_COMPLETED",
      "LEVEL_UP",
      "BADGE_EARNED"
    ],
    required: true
  },

  message: {
    type: String,
    required: true
  },

  referenceId: {
    type: mongoose.Schema.Types.ObjectId
  },

  visibility: {
    type: String,
    enum: ["PUBLIC"],
    default: "PUBLIC"
  }
}, { timestamps: true });

module.exports = mongoose.model("ActivityLog", activityLogSchema);
