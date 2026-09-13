const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const env = require("./config/env");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");

const dashboardRoutes = require("./routes/dashboardRoutes");

const errorMiddleware = require("./middleware/errorMiddleware");

const resumeRoutes = require("./routes/resumeRoutes");

const jobMatchRoutes = require("./routes/jobMatchRoutes");

const interviewRoutes = require("./routes/interviewRoutes");

const projectRoutes = require("./routes/projectRoutes");

const roadmapRoutes = require("./routes/roadmapRoutes");

const app = express();

// =========================
// Middleware
// =========================

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// =========================
// Database
// =========================

connectDB();

// =========================
// Health Check
// =========================

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "SkillSync AI Backend is running 🚀",
  });
});

// =========================
// Auth Routes
// =========================

app.use("/api/auth", authRoutes);

// =========================
// User Routes
// =========================

app.use("/api/users", userRoutes);

app.use("/api/resumes", resumeRoutes);

app.use("/api/dashboard", dashboardRoutes);

app.use("/api/job-matches", jobMatchRoutes);

app.use("/api/interviews", interviewRoutes);

app.use("/api/projects", projectRoutes);

app.use("/api/roadmaps", roadmapRoutes);

// =========================
// Error Middleware
// =========================

app.use(errorMiddleware);

// =========================
// Server
// =========================

app.listen(env.PORT, () => {
  console.log(`Server running on port ${env.PORT} 🚀`);
});