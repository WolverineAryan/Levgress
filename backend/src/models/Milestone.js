const mongoose = require('mongoose');

const milestoneSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    index: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    title: {
      type: String,
      required: [true, 'Milestone title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Milestone description is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['LOCKED', 'ACTIVE', 'SUBMITTED', 'COMPLETED', 'REJECTED'],
      default: 'LOCKED',
    },
    evidence: {
      type: { type: String, enum: ['TEXT', 'PDF', 'IMAGE', 'LINK'], default: 'TEXT' },
      text: { type: String, default: '' },
      url: { type: String, default: '' },
      fileName: { type: String, default: '' },
      fileData: { type: String, default: '' },
      submittedAt: { type: Date },
    },
    aiScore: {
      type: Number,
      default: null,
    },
    aiFeedback: {
      type: String,
      default: '',
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure uniqueness of index within a project
milestoneSchema.index({ project: 1, index: 1 }, { unique: true });

const Milestone = mongoose.model('Milestone', milestoneSchema);

module.exports = Milestone;
