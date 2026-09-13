const mongoose = require("mongoose");

const resumeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    fileName: {
      type: String,
      default: "",
    },

    fileUrl: {
      type: String,
      default: "",
    },

    originalName: {
      type: String,
      default: "",
    },

    parsedText: {
      type: String,
      default: "",
    },

    skills: {
      type: [String],
      default: [],
    },

    education: [
      {
        degree: {
          type: String,
          default: "",
        },
        institution: {
          type: String,
          default: "",
        },
        year: {
          type: String,
          default: "",
        },
      },
    ],

    experience: [
      {
        company: {
          type: String,
          default: "",
        },
        role: {
          type: String,
          default: "",
        },
        duration: {
          type: String,
          default: "",
        },
        description: {
          type: String,
          default: "",
        },
      },
    ],

    projects: [
      {
        name: {
          type: String,
          default: "",
        },
        description: {
          type: String,
          default: "",
        },
        technologies: {
          type: [String],
          default: [],
        },
      },
    ],

    certifications: {
      type: [String],
      default: [],
    },

    resumeScore: {
      type: Number,
      default: 0,
    },

    suggestions: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const Resume = mongoose.model("Resume", resumeSchema);

module.exports = Resume;