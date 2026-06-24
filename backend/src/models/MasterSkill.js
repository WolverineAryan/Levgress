const mongoose = require('mongoose');

const masterSkillSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: ['Frontend', 'Backend', 'Database', 'DevOps', 'Mobile', 'Other'],
    },
    description: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const MasterSkill = mongoose.model('MasterSkill', masterSkillSchema);

module.exports = MasterSkill;
