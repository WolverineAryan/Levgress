const mongoose = require("mongoose");

const masterSkillSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  category: String,
  xpReward: {
    type: Number,
    default: 50
  }
});

module.exports = mongoose.model("MasterSkill", masterSkillSchema);
