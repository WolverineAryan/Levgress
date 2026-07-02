const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    passwordHash: {
      type: String,
      required: false, // Optional for Google Sign-in
      select: false, // Don't return password by default
    },
    firebaseUid: {
      type: String,
      unique: true,
      sparse: true, // Allow multiple nulls for traditional credential users
    },
    username: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      lowercase: true,
    },
    role: {
      type: String,
      enum: ['STUDENT', 'STAFF'],
      default: 'STUDENT',
    },
    avatar: {
      type: String,
      default: '',
    },
    githubUrl: {
      type: String,
      default: '',
    },
    linkedinUrl: {
      type: String,
      default: '',
    },
    portfolioUrl: {
      type: String,
      default: '',
    },
    bio: {
      type: String,
      default: '',
    },
    resumeUrl: {
      type: String,
      default: '',
    },
    resumeFile: {
      fileName: { type: String, default: '' },
      fileData: { type: String, default: '' },
    },
    phoneNumber: {
      type: String,
      default: '',
    },
    batch: {
      type: String,
      default: '', // e.g. "Batch 2026", "Section A"
    },
    department: {
      type: String,
      default: '', // e.g. "Computer Science", "Information Technology"
    },
    customBadgeTitle: {
      type: String,
      default: '', // e.g. "Core Contributor", "Master Hacker"
    },
    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },
    twoFactorSecret: {
      type: String,
      default: '',
    },
    onboarded: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Method to verify password
userSchema.methods.comparePassword = async function (password) {
  if (!this.passwordHash) return false;
  return bcrypt.compare(password, this.passwordHash);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
