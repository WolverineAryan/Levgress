const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    icon: {
      type: String,
      required: true, // Icon name/string (e.g., 'zap', 'award', 'flame')
    },
    criteriaType: {
      type: String,
      enum: ['PROJECT_COUNT', 'STREAK', 'LEVEL_UP', 'XP_TOTAL', 'AI_SCORE_COUNT', 'SKILL_COUNT'],
      required: true,
    },
    criteriaValue: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      enum: ['PROJECTS', 'STREAKS', 'LEVELS', 'SPECIAL'],
      default: 'SPECIAL',
    },
    xpReward: {
      type: Number,
      default: 200,
    },
  },
  {
    timestamps: true,
  }
);

const Badge = mongoose.model('Badge', badgeSchema);

module.exports = Badge;
