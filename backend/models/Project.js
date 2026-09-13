const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      default: "",
      trim: true,
    },

    duration: {
      type: String,
      default: "",
      trim: true,
    },

    technologies: {
      type: [String],
      default: [],
    },

    features: {
      type: [String],
      default: [],
    },

    githubUrl: {
      type: String,
      default: "",
      trim: true,
    },

    liveUrl: {
      type: String,
      default: "",
      trim: true,
    },

    projectScore: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },

    strengths: {
      type: [String],
      default: [],
    },

    weaknesses: {
      type: [String],
      default: [],
    },

    improvements: {
      type: [String],
      default: [],
    },

    resumeRelevance: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },

    aiSummary: {
      type: String,
      default: "",
    },

    analyzedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Project = mongoose.model("Project", projectSchema);

module.exports = Project;