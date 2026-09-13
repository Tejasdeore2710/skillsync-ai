const User = require("../models/User");
const Resume = require("../models/Resume");
const Activity = require("../models/Activity");
const JobMatch = require("../models/JobMatch");
const Interview = require("../models/Interview");
const Project = require("../models/Project");
const Roadmap = require("../models/Roadmap");

// ======================================================
// GET DASHBOARD
// ======================================================

const getDashboard = async (req, res) => {
  try {
    const userId = req.user._id;

    // --------------------------------------------------
    // USER
    // --------------------------------------------------

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // --------------------------------------------------
    // FETCH USER DATA
    // --------------------------------------------------

    const resume = await Resume.findOne({
      user: userId,
    });

    const jobMatches = await JobMatch.find({
      user: userId,
    }).sort({
      createdAt: -1,
    });

    const interviews = await Interview.find({
      user: userId,
    }).sort({
      createdAt: -1,
    });

    const projects = await Project.find({
      user: userId,
    }).sort({
      createdAt: -1,
    });

    const roadmaps = await Roadmap.find({
      user: userId,
    }).sort({
      createdAt: -1,
    });

    const recentActivities = await Activity.find({
      user: userId,
    })
      .sort({
        createdAt: -1,
      })
      .limit(10);

    // --------------------------------------------------
    // RESUME STATISTICS
    // --------------------------------------------------

    const resumeScore = resume
      ? Number(resume.resumeScore || 0)
      : 0;

    const skillsCount =
      resume && Array.isArray(resume.skills)
        ? resume.skills.length
        : 0;

    const experienceCount =
      resume && Array.isArray(resume.experience)
        ? resume.experience.length
        : 0;

    const projectsFromResume =
      resume && Array.isArray(resume.projects)
        ? resume.projects.length
        : 0;

    const educationCount =
      resume && Array.isArray(resume.education)
        ? resume.education.length
        : 0;

    const certificationsCount =
      resume && Array.isArray(resume.certifications)
        ? resume.certifications.length
        : 0;

    // --------------------------------------------------
    // JOB MATCH STATISTICS
    // --------------------------------------------------

    const totalJobMatches = jobMatches.length;

    const averageMatchScore =
      totalJobMatches > 0
        ? Math.round(
            jobMatches.reduce(
              (total, job) =>
                total + Number(job.matchScore || 0),
              0
            ) / totalJobMatches
          )
        : 0;

    // --------------------------------------------------
    // INTERVIEW STATISTICS
    // --------------------------------------------------

    const totalInterviews = interviews.length;

    const completedInterviews = interviews.filter(
      (interview) =>
        interview.status === "completed"
    ).length;

    const startedInterviews = interviews.filter(
      (interview) =>
        interview.status === "in_progress" ||
        interview.status === "started"
    ).length;

    // --------------------------------------------------
    // PROJECT STATISTICS
    // --------------------------------------------------

    const totalProjects = projects.length;

    // --------------------------------------------------
    // ROADMAP STATISTICS
    // --------------------------------------------------

    const totalRoadmaps = roadmaps.length;

    const activeRoadmaps = roadmaps.filter(
      (roadmap) =>
        roadmap.status === "in_progress"
    ).length;

    const completedRoadmaps = roadmaps.filter(
      (roadmap) =>
        roadmap.status === "completed"
    ).length;

    const roadmapProgress =
      totalRoadmaps > 0
        ? Math.round(
            roadmaps.reduce(
              (total, roadmap) =>
                total + Number(roadmap.progress || 0),
              0
            ) / totalRoadmaps
          )
        : 0;

    // --------------------------------------------------
    // DASHBOARD RESPONSE
    // --------------------------------------------------

    return res.status(200).json({
      success: true,

      dashboard: {
        // ==================================================
        // USER
        // ==================================================

        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },

        // ==================================================
        // FLAT VALUES
        // Frontend dashboard cards use these values
        // ==================================================

        resumeScore: resumeScore,

        jobMatches: totalJobMatches,

        interviews: totalInterviews,

        projects: totalProjects,

        roadmaps: totalRoadmaps,

        careerProgress: roadmapProgress,

        // ==================================================
        // RESUME
        // ==================================================

        resume: {
          uploaded: !!resume,
          score: resumeScore,
          skillsCount: skillsCount,
          experienceCount: experienceCount,
          projectsCount: projectsFromResume,
          educationCount: educationCount,
          certificationsCount: certificationsCount,
        },

        // ==================================================
        // JOB MATCHING
        // ==================================================

        jobMatching: {
          totalMatches: totalJobMatches,
          averageMatchScore: averageMatchScore,
          latestMatch:
            jobMatches.length > 0
              ? jobMatches[0]
              : null,
        },

        // ==================================================
        // INTERVIEW DETAILS
        // ==================================================

        interviewStats: {
          total: totalInterviews,
          completed: completedInterviews,
          inProgress: startedInterviews,
          latest:
            interviews.length > 0
              ? interviews[0]
              : null,
        },

        // ==================================================
        // PROJECT DETAILS
        // ==================================================

        projectStats: {
          total: totalProjects,
          latest:
            projects.length > 0
              ? projects[0]
              : null,
        },

        // ==================================================
        // ROADMAP DETAILS
        // ==================================================

        roadmapStats: {
          total: totalRoadmaps,
          active: activeRoadmaps,
          completed: completedRoadmaps,
          averageProgress: roadmapProgress,
          latest:
            roadmaps.length > 0
              ? roadmaps[0]
              : null,
        },

        // ==================================================
        // OVERALL STATISTICS
        // ==================================================

        statistics: {
          resumeScore: resumeScore,

          skills: skillsCount,

          experience: experienceCount,

          projects:
            projectsFromResume +
            totalProjects,

          education: educationCount,

          certifications:
            certificationsCount,

          jobMatches:
            totalJobMatches,

          averageJobMatchScore:
            averageMatchScore,

          interviews:
            totalInterviews,

          completedInterviews:
            completedInterviews,

          projectsGenerated:
            totalProjects,

          roadmaps:
            totalRoadmaps,

          roadmapProgress:
            roadmapProgress,

          activities:
            recentActivities.length,
        },

        // ==================================================
        // RECENT ACTIVITIES
        // ==================================================

        recentActivities:
          recentActivities,
      },
    });
  } catch (error) {
    console.error(
      "Dashboard error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to load dashboard",
    });
  }
};

// ======================================================
// EXPORT
// ======================================================

module.exports = {
  getDashboard,
};