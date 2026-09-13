const express = require("express");

const {
  analyzeJob,
  getJobMatches,
  getJobMatchById,
  deleteJobMatch,
} = require("../controllers/jobMatchController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/analyze", authMiddleware, analyzeJob);

router.get("/", authMiddleware, getJobMatches);

router.get("/:id", authMiddleware, getJobMatchById);

router.delete("/:id", authMiddleware, deleteJobMatch);

module.exports = router;