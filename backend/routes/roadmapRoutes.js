const express = require("express");

const {
  createRoadmap,
  getRoadmaps,
  getRoadmap,
  updateRoadmap,
  deleteRoadmap,
} = require("../controllers/roadmapController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();


// Generate new roadmap
router.post(
  "/",
  authMiddleware,
  createRoadmap
);


// Get all roadmaps
router.get(
  "/",
  authMiddleware,
  getRoadmaps
);


// Get single roadmap
router.get(
  "/:id",
  authMiddleware,
  getRoadmap
);


// Update roadmap
router.put(
  "/:id",
  authMiddleware,
  updateRoadmap
);


// Delete roadmap
router.delete(
  "/:id",
  authMiddleware,
  deleteRoadmap
);


module.exports = router;