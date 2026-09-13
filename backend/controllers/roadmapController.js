const Roadmap = require("../models/Roadmap");
const Activity = require("../models/Activity");
const { generateRoadmap } = require("../services/ai/roadmapAI");


// ======================================================
// CREATE / GENERATE ROADMAP
// ======================================================

const createRoadmap = async (req, res) => {
  try {
    const userId = req.user._id;

    const {
      targetRole,
      currentLevel,
      careerGoal,
      timeline,
    } = req.body;

    // ------------------------------------------
    // VALIDATION
    // ------------------------------------------

    if (!targetRole || typeof targetRole !== "string") {
      return res.status(400).json({
        success: false,
        message: "Target role is required",
      });
    }

    console.log("Generating roadmap using AI... 🤖");

    // ------------------------------------------
    // AI ROADMAP GENERATION
    // ------------------------------------------
    // IMPORTANT:
    // generateRoadmap expects individual arguments,
    // not one object.

    const aiRoadmap = await generateRoadmap(
      targetRole,
      currentLevel || "",
      careerGoal || "",
      timeline || ""
    );

    console.log("Roadmap AI generation completed ✅");

    // ------------------------------------------
    // SAVE ROADMAP
    // ------------------------------------------

    const roadmap = await Roadmap.create({
      user: userId,

      targetRole: targetRole.trim(),

      currentLevel:
        typeof currentLevel === "string"
          ? currentLevel.trim()
          : "",

      careerGoal:
        typeof careerGoal === "string"
          ? careerGoal.trim()
          : "",

      timeline:
        typeof timeline === "string"
          ? timeline.trim()
          : "",

      overview:
        typeof aiRoadmap?.overview === "string"
          ? aiRoadmap.overview
          : "",

      steps: Array.isArray(aiRoadmap?.steps)
        ? aiRoadmap.steps.map((step) => ({
            title: String(step?.title || ""),

            description: String(
              step?.description || ""
            ),

            duration: String(
              step?.duration || ""
            ),

            topics: Array.isArray(step?.topics)
              ? step.topics.map(String)
              : [],

            resources: Array.isArray(step?.resources)
              ? step.resources.map(String)
              : [],

            completed: false,
          }))
        : [],

      skillsToLearn: Array.isArray(
        aiRoadmap?.skillsToLearn
      )
        ? aiRoadmap.skillsToLearn.map(String)
        : [],

      projects: Array.isArray(aiRoadmap?.projects)
        ? aiRoadmap.projects.map(String)
        : [],

      interviewPreparation: Array.isArray(
        aiRoadmap?.interviewPreparation
      )
        ? aiRoadmap.interviewPreparation.map(String)
        : [],

      resumePreparation: Array.isArray(
        aiRoadmap?.resumePreparation
      )
        ? aiRoadmap.resumePreparation.map(String)
        : [],

      status: "not_started",

      progress: 0,
    });

    console.log("Roadmap saved successfully ✅");

    // ------------------------------------------
    // CREATE ACTIVITY
    // ------------------------------------------

    await Activity.create({
      user: userId,

      type: "roadmap",

      title: "Career roadmap generated",

      description:
        `AI generated a roadmap for ${targetRole}`,

      metadata: {
        roadmapId: roadmap._id,
        targetRole: targetRole,
      },
    });

    console.log(
      "Roadmap activity created successfully ✅"
    );

    // ------------------------------------------
    // RESPONSE
    // ------------------------------------------

    return res.status(201).json({
      success: true,

      message: "Roadmap generated successfully",

      roadmap,
    });
  } catch (error) {
    console.error(
      "Create Roadmap Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to generate roadmap",
    });
  }
};


// ======================================================
// GET ALL ROADMAPS
// ======================================================

const getRoadmaps = async (req, res) => {
  try {
    const userId = req.user._id;

    const roadmaps = await Roadmap.find({
      user: userId,
    }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      count: roadmaps.length,
      roadmaps,
    });
  } catch (error) {
    console.error(
      "Get Roadmaps Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to fetch roadmaps",
    });
  }
};


// ======================================================
// GET SINGLE ROADMAP
// ======================================================

const getRoadmap = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const roadmap = await Roadmap.findOne({
      _id: id,
      user: userId,
    });

    if (!roadmap) {
      return res.status(404).json({
        success: false,
        message: "Roadmap not found",
      });
    }

    return res.status(200).json({
      success: true,
      roadmap,
    });
  } catch (error) {
    console.error(
      "Get Roadmap Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to fetch roadmap",
    });
  }
};


// ======================================================
// UPDATE ROADMAP
// ======================================================

const updateRoadmap = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const roadmap = await Roadmap.findOne({
      _id: id,
      user: userId,
    });

    if (!roadmap) {
      return res.status(404).json({
        success: false,
        message: "Roadmap not found",
      });
    }

    const allowedFields = [
      "status",
      "progress",
      "steps",
      "skillsToLearn",
      "projects",
      "interviewPreparation",
      "resumePreparation",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        roadmap[field] = req.body[field];
      }
    });

    await roadmap.save();

    return res.status(200).json({
      success: true,
      message: "Roadmap updated successfully",
      roadmap,
    });
  } catch (error) {
    console.error(
      "Update Roadmap Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to update roadmap",
    });
  }
};


// ======================================================
// DELETE ROADMAP
// ======================================================

const deleteRoadmap = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const roadmap = await Roadmap.findOneAndDelete({
      _id: id,
      user: userId,
    });

    if (!roadmap) {
      return res.status(404).json({
        success: false,
        message: "Roadmap not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Roadmap deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete Roadmap Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to delete roadmap",
    });
  }
};


// ======================================================
// EXPORT
// ======================================================

module.exports = {
  createRoadmap,
  getRoadmaps,
  getRoadmap,
  updateRoadmap,
  deleteRoadmap,
};