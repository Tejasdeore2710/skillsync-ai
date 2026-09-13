const express = require("express");

const {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  analyzeExistingProject,
  deleteProject,
} = require("../controllers/projectController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Create project + AI analysis
router.post(
  "/",
  authMiddleware,
  createProject
);

// Get all projects
router.get(
  "/",
  authMiddleware,
  getProjects
);

// Get single project
router.get(
  "/:id",
  authMiddleware,
  getProjectById
);

// Update project
router.put(
  "/:id",
  authMiddleware,
  updateProject
);

// Re-analyze project with AI
router.post(
  "/:id/analyze",
  authMiddleware,
  analyzeExistingProject
);

// Delete project
router.delete(
  "/:id",
  authMiddleware,
  deleteProject
);

module.exports = router;