const mongoose = require('mongoose');

const studentBadgeSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    badge: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Badge',
      required: true,
    },
    earnedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to prevent awarding the same badge twice to a student
studentBadgeSchema.index({ student: 1, badge: 1 }, { unique: true });

const StudentBadge = mongoose.model('StudentBadge', studentBadgeSchema);

module.exports = StudentBadge;
