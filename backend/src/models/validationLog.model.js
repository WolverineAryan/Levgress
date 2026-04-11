const mongoose = require("mongoose");

const validationLogSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project"
  },
  type: String,
  score: Number,
  verdict: String,
  feedback: [String],
  confidence: Number,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("ValidationLog", validationLogSchema);