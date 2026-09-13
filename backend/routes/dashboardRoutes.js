const express = require("express");

const {
  getDashboard,
} = require("../controllers/dashboardController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Get logged-in user's dashboard
router.get("/", authMiddleware, getDashboard);

module.exports = router;