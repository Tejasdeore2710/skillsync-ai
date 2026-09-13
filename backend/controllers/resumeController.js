const Resume = require("../models/Resume");
const Activity = require("../models/Activity");

const { extractPdfText } = require("../services/resume/pdfService");
const { analyzeResume } = require("../services/ai/resumeAIService");

const fs = require("fs");
const path = require("path");


// ===============================
// GET RESUME
// ===============================
const getResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({
      user: req.user._id,
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: "Resume not found",
      });
    }

    res.status(200).json({
      success: true,
      resume,
    });
  } catch (error) {
    console.error("Get resume error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch resume",
    });
  }
};


// ===============================
// UPLOAD + AI ANALYSIS
// ===============================
const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a resume file",
      });
    }

    // Find existing resume
    const existingResume = await Resume.findOne({
      user: req.user._id,
    });

    // Delete old file
    if (existingResume && existingResume.fileName) {
      const oldFilePath = path.join(
        __dirname,
        "..",
        "uploads",
        existingResume.fileName
      );

      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
    }

    // New file path
    const filePath = path.join(
      __dirname,
      "..",
      "uploads",
      req.file.filename
    );

    // ===============================
    // STEP 1: PDF TEXT EXTRACTION
    // ===============================

    let parsedText = "";

    if (
      path.extname(req.file.originalname).toLowerCase() === ".pdf"
    ) {
      parsedText = await extractPdfText(filePath);
    }

    if (!parsedText || !parsedText.trim()) {
      return res.status(400).json({
        success: false,
        message: "Unable to extract text from resume",
      });
    }

    console.log("Resume text extracted successfully ✅");


    // ===============================
    // STEP 2: AI ANALYSIS
    // ===============================

    console.log("Sending resume to AI for analysis... 🤖");

    const aiAnalysis = await analyzeResume(parsedText);

    console.log("Resume AI analysis completed ✅");


    // ===============================
    // STEP 3: PREPARE DATA
    // ===============================

    const resumeData = {
      user: req.user._id,

      fileName: req.file.filename,

      originalName: req.file.originalname,

      fileUrl: `/uploads/${req.file.filename}`,

      parsedText,

      skills: aiAnalysis.skills || [],

      education: aiAnalysis.education || [],

      experience: aiAnalysis.experience || [],

      projects: aiAnalysis.projects || [],

      certifications: aiAnalysis.certifications || [],

      resumeScore: aiAnalysis.resumeScore || 0,

      suggestions: aiAnalysis.suggestions || [],
    };


    // ===============================
    // STEP 4: SAVE RESUME
    // ===============================

    let resume;

    if (existingResume) {
      resume = await Resume.findOneAndUpdate(
        {
          user: req.user._id,
        },
        resumeData,
        {
          new: true,
          runValidators: true,
        }
      );
    } else {
      resume = await Resume.create(resumeData);
    }


    // ===============================
    // STEP 5: CREATE ACTIVITIES
    // ===============================

    await Activity.create([
      {
        user: req.user._id,

        type: "resume_upload",

        title: "Resume uploaded",

        description: `Uploaded ${req.file.originalname}`,

        metadata: {
          resumeId: resume._id,
          fileName: req.file.originalname,
        },
      },

      {
        user: req.user._id,

        type: "resume_analysis",

        title: "Resume analyzed by AI",

        description: `AI analyzed your resume and generated a score of ${resume.resumeScore}/100`,

        metadata: {
          resumeId: resume._id,
          resumeScore: resume.resumeScore,
        },
      },
    ]);

    console.log("Resume activities created successfully ✅");


    // ===============================
    // STEP 6: RESPONSE
    // ===============================

    res.status(200).json({
      success: true,

      message: "Resume uploaded, processed and analyzed successfully",

      resume: {
        _id: resume._id,

        fileName: resume.fileName,

        originalName: resume.originalName,

        fileUrl: resume.fileUrl,

        parsedText: resume.parsedText,

        skills: resume.skills,

        education: resume.education,

        experience: resume.experience,

        projects: resume.projects,

        certifications: resume.certifications,

        resumeScore: resume.resumeScore,

        suggestions: resume.suggestions,
      },
    });

  } catch (error) {
    console.error("Upload resume error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to upload and analyze resume",
      error: error.message,
    });
  }
};


// ===============================
// UPDATE RESUME DATA
// ===============================
const updateResumeData = async (req, res) => {
  try {
    const {
      parsedText,
      skills,
      education,
      experience,
      projects,
      certifications,
      resumeScore,
      suggestions,
    } = req.body;

    const resume = await Resume.findOneAndUpdate(
      {
        user: req.user._id,
      },
      {
        parsedText,
        skills,
        education,
        experience,
        projects,
        certifications,
        resumeScore,
        suggestions,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: "Resume not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Resume data updated successfully",
      resume,
    });

  } catch (error) {
    console.error("Update resume error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to update resume data",
    });
  }
};


// ===============================
// DELETE RESUME
// ===============================
const deleteResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({
      user: req.user._id,
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: "Resume not found",
      });
    }

    // Delete physical file
    if (resume.fileName) {
      const filePath = path.join(
        __dirname,
        "..",
        "uploads",
        resume.fileName
      );

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // Delete database document
    await Resume.deleteOne({
      _id: resume._id,
    });

    res.status(200).json({
      success: true,
      message: "Resume deleted successfully",
    });

  } catch (error) {
    console.error("Delete resume error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to delete resume",
    });
  }
};


module.exports = {
  getResume,
  uploadResume,
  updateResumeData,
  deleteResume,
};