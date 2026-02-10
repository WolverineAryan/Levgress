    const mongoose = require("mongoose");

const skillSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  category: {
    type: String, // Programming, Design, Soft Skill
    required: true
  },
  domain: {
    type: String // Web, App, AI, etc.
  }
}, { timestamps: true });

module.exports = mongoose.model("Skill", skillSchema);
