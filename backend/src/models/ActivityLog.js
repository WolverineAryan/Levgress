const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    activityType: {
      type: String,
      enum: ['PROJECT_CREATE', 'PROJECT_DELETE', 'MILESTONE_SUBMIT', 'MILESTONE_COMPLETE', 'LEVEL_UP', 'BADGE_EARN', 'STAGNATION', 'CERTIFICATE_UPLOADED', 'CERTIFICATE_REVIEWED'],
      required: true,
    },
    details: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);

module.exports = ActivityLog;
