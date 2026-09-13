const Interview = require("../models/Interview");
const Resume = require("../models/Resume");
const Activity = require("../models/Activity");

const {
  generateInterviewQuestions,
  evaluateInterviewAnswer,
} = require("../services/ai/interviewAI");


// ==========================================
// CREATE INTERVIEW
// ==========================================

const createInterview = async (req, res) => {
  try {
    const userId = req.user._id;

    const {
      targetRole,
      company,
      interviewType,
      difficulty,
    } = req.body;

    if (!targetRole) {
      return res.status(400).json({
        success: false,
        message: "Target role is required",
      });
    }

    // Find user's resume
    const resume = await Resume.findOne({
      user: userId,
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: "Please upload a resume before starting an interview",
      });
    }

    if (!resume.parsedText || !resume.parsedText.trim()) {
      return res.status(400).json({
        success: false,
        message: "Resume text is not available",
      });
    }

    const selectedInterviewType = interviewType || "mixed";
    const selectedDifficulty = difficulty || "medium";

    console.log("Starting AI interview creation... 🎯");

    // Generate AI questions
    const questions = await generateInterviewQuestions(
      resume.parsedText,
      targetRole,
      selectedInterviewType,
      selectedDifficulty,
      company || ""
    );

    if (!questions.length) {
      return res.status(500).json({
        success: false,
        message: "Unable to generate interview questions",
      });
    }

    // Create interview
    const interview = await Interview.create({
      user: userId,
      targetRole,
      company: company || "",
      interviewType: selectedInterviewType,
      difficulty: selectedDifficulty,
      questions,
      status: "created",
    });

    console.log("Interview created successfully ✅");

    // Create activity
    await Activity.create({
      user: userId,
      type: "interview",
      title: "AI interview created",
      description: `Created an AI mock interview for ${targetRole}`,
      metadata: {
        interviewId: interview._id,
        targetRole,
        company: company || "",
        questionCount: questions.length,
      },
    });

    console.log("Interview activity created successfully ✅");

    res.status(201).json({
      success: true,
      message: "Interview created successfully",
      interview,
    });
  } catch (error) {
    console.error("Create Interview Error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to create interview",
    });
  }
};


// ==========================================
// GET ALL INTERVIEWS
// ==========================================

const getInterviews = async (req, res) => {
  try {
    const userId = req.user._id;

    const interviews = await Interview.find({
      user: userId,
    }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: interviews.length,
      interviews,
    });
  } catch (error) {
    console.error("Get Interviews Error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch interviews",
    });
  }
};


// ==========================================
// GET SINGLE INTERVIEW
// ==========================================

const getInterviewById = async (req, res) => {
  try {
    const userId = req.user._id;

    const interview = await Interview.findOne({
      _id: req.params.id,
      user: userId,
    });

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found",
      });
    }

    res.status(200).json({
      success: true,
      interview,
    });
  } catch (error) {
    console.error("Get Interview Error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch interview",
    });
  }
};


// ==========================================
// START INTERVIEW
// ==========================================

const startInterview = async (req, res) => {
  try {
    const userId = req.user._id;

    const interview = await Interview.findOne({
      _id: req.params.id,
      user: userId,
    });

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found",
      });
    }

    interview.status = "in_progress";
    interview.startedAt = new Date();

    await interview.save();

    res.status(200).json({
      success: true,
      message: "Interview started successfully",
      interview,
    });
  } catch (error) {
    console.error("Start Interview Error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to start interview",
    });
  }
};


// ==========================================
// SUBMIT ANSWER
// ==========================================

const submitAnswer = async (req, res) => {
  try {
    const userId = req.user._id;

    const {
      questionId,
      answer,
    } = req.body;

    if (!questionId || !answer) {
      return res.status(400).json({
        success: false,
        message: "Question ID and answer are required",
      });
    }

    const interview = await Interview.findOne({
      _id: req.params.id,
      user: userId,
    });

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found",
      });
    }

    const question = interview.questions.id(questionId);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    console.log("Evaluating interview answer... 🤖");

    // AI evaluation
    const evaluation = await evaluateInterviewAnswer(
      question.question,
      answer,
      interview.targetRole,
      question.category
    );

    // Update question
    question.answer = answer;
    question.score = evaluation.score;
    question.feedback = evaluation.feedback;
    question.strengths = evaluation.strengths;
    question.improvements = evaluation.improvements;

    interview.status = "in_progress";

    await interview.save();

    console.log("Interview answer saved successfully ✅");

    res.status(200).json({
      success: true,
      message: "Answer evaluated successfully",
      evaluation,
      question,
    });
  } catch (error) {
    console.error("Submit Interview Answer Error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to evaluate interview answer",
    });
  }
};


// ==========================================
// COMPLETE INTERVIEW
// ==========================================

const completeInterview = async (req, res) => {
  try {
    const userId = req.user._id;

    const interview = await Interview.findOne({
      _id: req.params.id,
      user: userId,
    });

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found",
      });
    }

    const answeredQuestions = interview.questions.filter(
      (question) =>
        question.answer &&
        question.answer.trim() &&
        question.score !== null
    );

    if (!answeredQuestions.length) {
      return res.status(400).json({
        success: false,
        message: "Please answer at least one question before completing the interview",
      });
    }

    // Calculate overall score
    const totalScore = answeredQuestions.reduce(
      (sum, question) => sum + question.score,
      0
    );

    const overallScore = Math.round(
      totalScore / answeredQuestions.length
    );

    // Collect strengths and improvements
    const strengths = [
      ...new Set(
        answeredQuestions.flatMap(
          (question) => question.strengths || []
        )
      ),
    ].slice(0, 10);

    const improvements = [
      ...new Set(
        answeredQuestions.flatMap(
          (question) => question.improvements || []
        )
      ),
    ].slice(0, 10);

    interview.overallScore = overallScore;

    interview.overallFeedback =
      overallScore >= 80
        ? "Excellent interview performance. Keep improving your weak areas and continue practicing."
        : overallScore >= 60
        ? "Good performance. With more practice and stronger answers, your interview performance can improve further."
        : "You need more interview practice. Focus on the improvement areas and strengthen your fundamentals.";

    interview.strengths = strengths;
    interview.improvements = improvements;
    interview.status = "completed";
    interview.completedAt = new Date();

    await interview.save();

    // Create activity
    await Activity.create({
      user: userId,
      type: "interview",
      title: "Interview completed",
      description: `Completed ${interview.targetRole} mock interview with a score of ${overallScore}/100`,
      metadata: {
        interviewId: interview._id,
        targetRole: interview.targetRole,
        overallScore,
      },
    });

    console.log("Interview completed successfully ✅");

    res.status(200).json({
      success: true,
      message: "Interview completed successfully",
      interview,
    });
  } catch (error) {
    console.error("Complete Interview Error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to complete interview",
    });
  }
};


// ==========================================
// DELETE INTERVIEW
// ==========================================

const deleteInterview = async (req, res) => {
  try {
    const userId = req.user._id;

    const interview = await Interview.findOneAndDelete({
      _id: req.params.id,
      user: userId,
    });

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Interview deleted successfully",
    });
  } catch (error) {
    console.error("Delete Interview Error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to delete interview",
    });
  }
};


module.exports = {
  createInterview,
  getInterviews,
  getInterviewById,
  startInterview,
  submitAnswer,
  completeInterview,
  deleteInterview,
};