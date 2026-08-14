const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Certificate title is required'],
      trim: true,
    },
    issuingOrganization: {
      type: String,
      required: [true, 'Issuing organization is required'],
      trim: true,
    },
    issueDate: {
      type: Date,
      required: [true, 'Issue date is required'],
    },
    expirationDate: {
      type: Date,
      default: null,
    },
    credentialId: {
      type: String,
      trim: true,
      default: '',
    },
    credentialUrl: {
      type: String,
      trim: true,
      default: '',
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    skills: [
      {
        type: String,
        trim: true,
      },
    ],
    file: {
      fileName: { type: String, default: '' },
      fileData: { type: String, default: '' },
    },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      default: 'PENDING',
      index: true,
    },
    staffReviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    staffFeedback: {
      type: String,
      default: '',
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

certificateSchema.index({ student: 1, status: 1 });

const Certificate = mongoose.model('Certificate', certificateSchema);

module.exports = Certificate;
