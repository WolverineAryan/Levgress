const mongoose = require("mongoose");

const xpHistorySchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  xpChange: {
    type: Number,
    required: true,
  },
  totalXpAfter: {
    type: Number,
    required: true,
  },
  reason: {
    type: String,   
  },
}, { timestamps: true });

module.exports = mongoose.model("XpHistory", xpHistorySchema);