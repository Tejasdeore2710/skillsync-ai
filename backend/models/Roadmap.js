const mongoose = require("mongoose");

const roadmapStepSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      default: "",
    },

    duration: {
      type: String,
      default: "",
    },

    topics: {
      type: [String],
      default: [],
    },

    resources: {
      type: [String],
      default: [],
    },

    completed: {
      type: Boolean,
      default: false,
    },
  },
  {
    _id: true,
  }
);

const roadmapSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    targetRole: {
      type: String,
      required: true,
    },

    currentLevel: {
      type: String,
      default: "",
    },

    careerGoal: {
      type: String,
      default: "",
    },

    timeline: {
      type: String,
      default: "",
    },

    overview: {
      type: String,
      default: "",
    },

    steps: {
      type: [roadmapStepSchema],
      default: [],
    },

    skillsToLearn: {
      type: [String],
      default: [],
    },

    projects: {
      type: [String],
      default: [],
    },

    interviewPreparation: {
      type: [String],
      default: [],
    },

    resumePreparation: {
      type: [String],
      default: [],
    },

    status: {
      type: String,
      enum: ["not_started", "in_progress", "completed"],
      default: "not_started",
    },

    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
  },
  {
    timestamps: true,
  }
);

const Roadmap = mongoose.model("Roadmap", roadmapSchema);

module.exports = Roadmap;