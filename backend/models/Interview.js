const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      enum: [
        "technical",
        "behavioral",
        "hr",
        "situational",
        "project",
      ],
      default: "technical",
    },

    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },

    answer: {
      type: String,
      default: "",
    },

    score: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },

    feedback: {
      type: String,
      default: "",
    },

    strengths: {
      type: [String],
      default: [],
    },

    improvements: {
      type: [String],
      default: [],
    },
  },
  {
    _id: true,
  }
);

const interviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    targetRole: {
      type: String,
      required: true,
      trim: true,
    },

    company: {
      type: String,
      default: "",
      trim: true,
    },

    interviewType: {
      type: String,
      enum: [
        "technical",
        "hr",
        "behavioral",
        "mixed",
      ],
      default: "mixed",
    },

    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },

    questions: {
      type: [questionSchema],
      default: [],
    },

    overallScore: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },

    overallFeedback: {
      type: String,
      default: "",
    },

    strengths: {
      type: [String],
      default: [],
    },

    improvements: {
      type: [String],
      default: [],
    },

    status: {
      type: String,
      enum: ["created", "in_progress", "completed"],
      default: "created",
    },

    startedAt: {
      type: Date,
      default: null,
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

const Interview = mongoose.model("Interview", interviewSchema);

module.exports = Interview;