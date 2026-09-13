const JobMatch = require("../models/JobMatch");
const Resume = require("../models/Resume");
const Activity = require("../models/Activity");
const { analyzeJobMatch } = require("../services/ai/jobMatchAI");

// Analyze a job against user's resume
const analyzeJob = async (req, res) => {
  try {
    const userId = req.user._id;

    const {
      jobTitle,
      company,
      jobDescription,
    } = req.body;

    // Validate input
    if (!jobTitle || !jobDescription) {
      return res.status(400).json({
        success: false,
        message: "Job title and job description are required",
      });
    }

    // Find user's resume
    const resume = await Resume.findOne({
      user: userId,
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: "Please upload a resume before analyzing a job",
      });
    }

    if (!resume.parsedText || !resume.parsedText.trim()) {
      return res.status(400).json({
        success: false,
        message: "Resume text is not available",
      });
    }

    console.log("Starting job match analysis... 🔍");

    // Analyze resume against job description
    const analysis = await analyzeJobMatch(
      resume.parsedText,
      jobDescription
    );

    // Save job match
    const jobMatch = await JobMatch.create({
      user: userId,
      jobTitle,
      company: company || "",
      jobDescription,
      matchScore: analysis.matchScore,
      matchedSkills: analysis.matchedSkills,
      missingSkills: analysis.missingSkills,
      strengths: analysis.strengths,
      weaknesses: analysis.weaknesses,
      recommendations: analysis.recommendations,
      analyzedAt: new Date(),
    });

    console.log("Job match saved successfully ✅");

    // Create activity
    await Activity.create({
      user: userId,
      type: "job_match",
      title: "Job match analyzed",
      description: `AI analyzed your resume for ${jobTitle} with a match score of ${analysis.matchScore}/100`,
      metadata: {
        jobMatchId: jobMatch._id,
        jobTitle,
        company: company || "",
        matchScore: analysis.matchScore,
      },
    });

    console.log("Job match activity created successfully ✅");

    res.status(201).json({
      success: true,
      message: "Job analyzed successfully",
      jobMatch,
    });
  } catch (error) {
    console.error("Job Match Controller Error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to analyze job",
    });
  }
};


// Get all job matches of logged-in user
const getJobMatches = async (req, res) => {
  try {
    const userId = req.user._id;

    const jobMatches = await JobMatch.find({
      user: userId,
    }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: jobMatches.length,
      jobMatches,
    });
  } catch (error) {
    console.error("Get Job Matches Error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch job matches",
    });
  }
};


// Get single job match
const getJobMatchById = async (req, res) => {
  try {
    const userId = req.user._id;

    const jobMatch = await JobMatch.findOne({
      _id: req.params.id,
      user: userId,
    });

    if (!jobMatch) {
      return res.status(404).json({
        success: false,
        message: "Job match not found",
      });
    }

    res.status(200).json({
      success: true,
      jobMatch,
    });
  } catch (error) {
    console.error("Get Job Match Error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch job match",
    });
  }
};


// Delete a job match
const deleteJobMatch = async (req, res) => {
  try {
    const userId = req.user._id;

    const jobMatch = await JobMatch.findOneAndDelete({
      _id: req.params.id,
      user: userId,
    });

    if (!jobMatch) {
      return res.status(404).json({
        success: false,
        message: "Job match not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Job match deleted successfully",
    });
  } catch (error) {
    console.error("Delete Job Match Error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to delete job match",
    });
  }
};


module.exports = {
  analyzeJob,
  getJobMatches,
  getJobMatchById,
  deleteJobMatch,
};