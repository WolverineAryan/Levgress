const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    category: {
      type: String,
      enum: ['BUG', 'FEEDBACK', 'SUPPORT', 'OTHER'],
      default: 'BUG',
    },
    description: {
      type: String,
      required: [true, 'Report description is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'REVIEWED', 'RESOLVED'],
      default: 'PENDING',
    },
  },
  {
    timestamps: true,
  }
);

const Report = mongoose.model('Report', reportSchema);

module.exports = Report;
