const mongoose = require("mongoose");

const badgeEvalLogSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  badgeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Badge",
    required: true
  },
  eventType: {
    type: String,
    required: true
  },
  result: {
    type: String,
    enum: ["EARNED", "NOT_EARNED"],
    required: true
  },
  evaluatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("BadgeEvaluationLog", badgeEvalLogSchema);
