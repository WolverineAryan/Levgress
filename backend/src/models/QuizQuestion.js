const mongoose = require('mongoose');

const quizQuestionSchema = new mongoose.Schema(
  {
    skillName: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    tier: {
      type: String,
      enum: ['BASIC', 'INTERMEDIATE', 'MASTER'],
      required: true,
      index: true,
    },
    question: {
      type: String,
      required: true,
      trim: true,
    },
    options: {
      type: [String],
      required: true,
      validate: [
        (val) => val.length === 4,
        'Question must have exactly 4 options'
      ],
    },
    answerIndex: {
      type: Number,
      required: true,
      min: 0,
      max: 3,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to speed up random retrieval per skill and tier
quizQuestionSchema.index({ skillName: 1, tier: 1 });

const QuizQuestion = mongoose.model('QuizQuestion', quizQuestionSchema);

module.exports = QuizQuestion;
