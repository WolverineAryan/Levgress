const mongoose = require("mongoose");

const badgeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },

  description: String,

  category: {
    type: String,
    enum: ["SKILL", "PROJECT", "LEVEL", "CONSISTENCY"],
    required: true
  },

  triggerEvents: {
    type: [String],
    required: true
  },

  criteria: {
    type: Object, // JSON rules
    required: true
  },

  iconUrl: String,

  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model("Badge", badgeSchema);
