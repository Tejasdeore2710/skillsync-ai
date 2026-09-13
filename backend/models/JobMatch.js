const mongoose = require("mongoose");

const jobMatchSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    jobTitle: {
      type: String,
      required: true,
      trim: true,
    },

    company: {
      type: String,
      default: "",
      trim: true,
    },

    jobDescription: {
      type: String,
      required: true,
    },

    matchScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    matchedSkills: {
      type: [String],
      default: [],
    },

    missingSkills: {
      type: [String],
      default: [],
    },

    strengths: {
      type: [String],
      default: [],
    },

    weaknesses: {
      type: [String],
      default: [],
    },

    recommendations: {
      type: [String],
      default: [],
    },

    analyzedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const JobMatch = mongoose.model("JobMatch", jobMatchSchema);

module.exports = JobMatch;