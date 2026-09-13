const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");

const {
  getProfile,
  updateProfile,
  changePassword,
  deleteAccount,
} = require("../controllers/userController");

const router = express.Router();

router.get("/me", authMiddleware, getProfile);

router.put("/me", authMiddleware, updateProfile);

router.put("/password", authMiddleware, changePassword);

router.delete("/me", authMiddleware, deleteAccount);

module.exports = router;