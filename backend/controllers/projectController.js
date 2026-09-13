const Project = require("../models/Project");
const Resume = require("../models/Resume");
const Activity = require("../models/Activity");

const {
  analyzeProject,
} = require("../services/ai/projectAI");


// ==========================================
// CREATE PROJECT
// ==========================================

const createProject = async (req, res) => {
  try {
    const userId = req.user._id;

    const {
      name,
      description,
      role,
      duration,
      technologies,
      features,
      githubUrl,
      liveUrl,
    } = req.body;

    if (!name || !description) {
      return res.status(400).json({
        success: false,
        message: "Project name and description are required",
      });
    }

    // Find resume for AI context
    const resume = await Resume.findOne({
      user: userId,
    });

    const resumeText =
      resume?.parsedText || "";

    console.log("Starting project creation... 🚀");

    // AI analysis
    const analysis = await analyzeProject(
      name,
      description,
      technologies || [],
      features || [],
      resumeText
    );

    // Save project
    const project = await Project.create({
      user: userId,
      name,
      description,
      role: role || "",
      duration: duration || "",
      technologies: Array.isArray(technologies)
        ? technologies
        : [],
      features: Array.isArray(features)
        ? features
        : [],
      githubUrl: githubUrl || "",
      liveUrl: liveUrl || "",

      projectScore: analysis.projectScore,
      strengths: analysis.strengths,
      weaknesses: analysis.weaknesses,
      improvements: analysis.improvements,
      resumeRelevance: analysis.resumeRelevance,
      aiSummary: analysis.aiSummary,
      analyzedAt: new Date(),
    });

    console.log("Project saved successfully ✅");

    // Activity
    await Activity.create({
      user: userId,
      type: "project",
      title: "Project analyzed by AI",
      description: `AI analyzed your project "${name}" with a project score of ${analysis.projectScore}/100`,
      metadata: {
        projectId: project._id,
        projectName: name,
        projectScore: analysis.projectScore,
        resumeRelevance: analysis.resumeRelevance,
      },
    });

    console.log(
      "Project activity created successfully ✅"
    );

    res.status(201).json({
      success: true,
      message: "Project created and analyzed successfully",
      project,
    });
  } catch (error) {
    console.error(
      "Create Project Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Unable to create project",
    });
  }
};


// ==========================================
// GET ALL PROJECTS
// ==========================================

const getProjects = async (req, res) => {
  try {
    const userId = req.user._id;

    const projects = await Project.find({
      user: userId,
    }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: projects.length,
      projects,
    });
  } catch (error) {
    console.error(
      "Get Projects Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Unable to fetch projects",
    });
  }
};


// ==========================================
// GET SINGLE PROJECT
// ==========================================

const getProjectById = async (req, res) => {
  try {
    const userId = req.user._id;

    const project = await Project.findOne({
      _id: req.params.id,
      user: userId,
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    res.status(200).json({
      success: true,
      project,
    });
  } catch (error) {
    console.error(
      "Get Project Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Unable to fetch project",
    });
  }
};


// ==========================================
// UPDATE PROJECT
// ==========================================

const updateProject = async (req, res) => {
  try {
    const userId = req.user._id;

    const project = await Project.findOne({
      _id: req.params.id,
      user: userId,
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    const {
      name,
      description,
      role,
      duration,
      technologies,
      features,
      githubUrl,
      liveUrl,
    } = req.body;

    if (name !== undefined) {
      project.name = name;
    }

    if (description !== undefined) {
      project.description = description;
    }

    if (role !== undefined) {
      project.role = role;
    }

    if (duration !== undefined) {
      project.duration = duration;
    }

    if (technologies !== undefined) {
      project.technologies = Array.isArray(
        technologies
      )
        ? technologies
        : [];
    }

    if (features !== undefined) {
      project.features = Array.isArray(features)
        ? features
        : [];
    }

    if (githubUrl !== undefined) {
      project.githubUrl = githubUrl;
    }

    if (liveUrl !== undefined) {
      project.liveUrl = liveUrl;
    }

    await project.save();

    // Activity
    await Activity.create({
      user: userId,
      type: "project",
      title: "Project updated",
      description: `Updated project "${project.name}"`,
      metadata: {
        projectId: project._id,
        projectName: project.name,
      },
    });

    res.status(200).json({
      success: true,
      message: "Project updated successfully",
      project,
    });
  } catch (error) {
    console.error(
      "Update Project Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Unable to update project",
    });
  }
};


// ==========================================
// RE-ANALYZE PROJECT
// ==========================================

const analyzeExistingProject = async (
  req,
  res
) => {
  try {
    const userId = req.user._id;

    const project = await Project.findOne({
      _id: req.params.id,
      user: userId,
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    const resume = await Resume.findOne({
      user: userId,
    });

    const resumeText =
      resume?.parsedText || "";

    console.log(
      "Re-analyzing project with AI... 🤖"
    );

    const analysis = await analyzeProject(
      project.name,
      project.description,
      project.technologies,
      project.features,
      resumeText
    );

    project.projectScore =
      analysis.projectScore;

    project.strengths =
      analysis.strengths;

    project.weaknesses =
      analysis.weaknesses;

    project.improvements =
      analysis.improvements;

    project.resumeRelevance =
      analysis.resumeRelevance;

    project.aiSummary =
      analysis.aiSummary;

    project.analyzedAt = new Date();

    await project.save();

    await Activity.create({
      user: userId,
      type: "project",
      title: "Project re-analyzed by AI",
      description: `AI re-analyzed "${project.name}" with a score of ${analysis.projectScore}/100`,
      metadata: {
        projectId: project._id,
        projectName: project.name,
        projectScore: analysis.projectScore,
      },
    });

    res.status(200).json({
      success: true,
      message: "Project analyzed successfully",
      project,
    });
  } catch (error) {
    console.error(
      "Analyze Project Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Unable to analyze project",
    });
  }
};


// ==========================================
// DELETE PROJECT
// ==========================================

const deleteProject = async (req, res) => {
  try {
    const userId = req.user._id;

    const project = await Project.findOneAndDelete({
      _id: req.params.id,
      user: userId,
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete Project Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Unable to delete project",
    });
  }
};


module.exports = {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  analyzeExistingProject,
  deleteProject,
};