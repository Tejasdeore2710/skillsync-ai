const express = require("express");

const {
  getResume,
  uploadResume,
  updateResumeData,
  deleteResume,
} = require("../controllers/resumeController");

const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

// Get logged-in user's resume
router.get("/", authMiddleware, getResume);

// Upload resume
router.post(
  "/upload",
  authMiddleware,
  upload.single("resume"),
  uploadResume
);

// Update parsed resume data
router.put("/data", authMiddleware, updateResumeData);

// Delete resume
router.delete("/", authMiddleware, deleteResume);

module.exports = router;