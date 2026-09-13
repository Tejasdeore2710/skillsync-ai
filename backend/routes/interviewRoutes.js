const express = require("express");

const {
  createInterview,
  getInterviews,
  getInterviewById,
  startInterview,
  submitAnswer,
  completeInterview,
  deleteInterview,
} = require("../controllers/interviewController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Create a new AI interview
router.post("/", authMiddleware, createInterview);

// Get all interviews
router.get("/", authMiddleware, getInterviews);

// Get single interview
router.get("/:id", authMiddleware, getInterviewById);

// Start interview
router.put("/:id/start", authMiddleware, startInterview);

// Submit and evaluate an answer
router.post("/:id/answer", authMiddleware, submitAnswer);

// Complete interview
router.put("/:id/complete", authMiddleware, completeInterview);

// Delete interview
router.delete("/:id", authMiddleware, deleteInterview);

module.exports = router;