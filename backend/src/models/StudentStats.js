const mongoose = require('mongoose');

const skillProgressSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  tier: {
    type: String,
    enum: ['UNVERIFIED', 'BASIC', 'INTERMEDIATE', 'MASTER'],
    default: 'UNVERIFIED',
  },
  type: {
    type: String,
    enum: ['TECHNOLOGY', 'SKILL'],
    default: 'TECHNOLOGY',
    required: true,
  },
});

const studentStatsSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    xp: {
      type: Number,
      default: 0,
    },
    level: {
      type: Number,
      default: 1,
    },
    streak: {
      type: Number,
      default: 0,
    },
    lastActive: {
      type: Date,
      default: Date.now,
    },
    skills: [skillProgressSchema],
  },
  {
    timestamps: true,
  }
);

const StudentStats = mongoose.model('StudentStats', studentStatsSchema);

module.exports = StudentStats;
