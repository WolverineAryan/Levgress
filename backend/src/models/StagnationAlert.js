const mongoose = require("mongoose");

const stagnationAlertSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  level: {
    type: String,
    enum: ["SLOW", "STAGNATED", "CRITICAL"],
    required: true
  },

  daysInactive: {
    type: Number,
    required: true
  },

  isResolved: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model("StagnationAlert", stagnationAlertSchema);
