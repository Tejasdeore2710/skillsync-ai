const { generateAIResponse } = require("./groqService");

const parseAIResponse = (response) => {
  try {
    return JSON.parse(response);
  } catch (error) {
    const cleanedResponse = response
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    return JSON.parse(cleanedResponse);
  }
};


// ==========================================
// ANALYZE PROJECT
// ==========================================

const analyzeProject = async (
  projectName,
  projectDescription,
  technologies,
  features = [],
  resumeText = ""
) => {
  try {
    if (!projectName || !projectName.trim()) {
      throw new Error("Project name is required");
    }

    if (!projectDescription || !projectDescription.trim()) {
      throw new Error("Project description is required");
    }

    const technologyText = Array.isArray(technologies)
      ? technologies.join(", ")
      : String(technologies || "");

    const featureText = Array.isArray(features)
      ? features.join(", ")
      : String(features || "");

    const prompt = `
Analyze this software project as an expert software engineer and career advisor.

The goal is to evaluate the quality of the project, identify strengths and weaknesses,
suggest improvements, and determine how valuable the project is for a software
developer's resume.

IMPORTANT:
- Do not invent information.
- Use only the project information and resume information provided.
- If resume information is unavailable, determine resume relevance based only on project quality.
- projectScore must be a number from 0 to 100.
- resumeRelevance must be a number from 0 to 100.
- Return ONLY valid JSON.
- Do not return markdown.
- Do not return code fences.
- Do not return explanations outside JSON.

PROJECT NAME:
${projectName}

PROJECT DESCRIPTION:
${projectDescription}

TECHNOLOGIES:
${technologyText || "Not specified"}

FEATURES:
${featureText || "Not specified"}

CANDIDATE RESUME:
${resumeText || "Resume information not available"}

Return EXACTLY this structure:

{
  "projectScore": 85,

  "strengths": [
    "Uses relevant backend technologies",
    "Demonstrates REST API development"
  ],

  "weaknesses": [
    "Testing strategy is not clearly described",
    "Deployment details are missing"
  ],

  "improvements": [
    "Add automated testing",
    "Deploy the application using a cloud platform",
    "Add monitoring and logging"
  ],

  "resumeRelevance": 90,

  "aiSummary": "This is a strong backend project that demonstrates practical software development skills."
}
`;

    console.log("Analyzing project with AI... 🤖");

    const response = await generateAIResponse(prompt);

    const parsedResponse = parseAIResponse(response);

    let projectScore = Number(parsedResponse.projectScore);

    if (Number.isNaN(projectScore)) {
      projectScore = 0;
    }

    projectScore = Math.max(
      0,
      Math.min(100, projectScore)
    );

    let resumeRelevance = Number(
      parsedResponse.resumeRelevance
    );

    if (Number.isNaN(resumeRelevance)) {
      resumeRelevance = 0;
    }

    resumeRelevance = Math.max(
      0,
      Math.min(100, resumeRelevance)
    );

    const strengths = Array.isArray(parsedResponse.strengths)
      ? parsedResponse.strengths.map(String)
      : [];

    const weaknesses = Array.isArray(parsedResponse.weaknesses)
      ? parsedResponse.weaknesses.map(String)
      : [];

    const improvements = Array.isArray(
      parsedResponse.improvements
    )
      ? parsedResponse.improvements.map(String)
      : [];

    const aiSummary = String(
      parsedResponse.aiSummary || ""
    );

    console.log("Project AI analysis completed ✅");

    return {
      projectScore,
      strengths,
      weaknesses,
      improvements,
      resumeRelevance,
      aiSummary,
    };
  } catch (error) {
    console.error("Project AI analysis error:", error);

    throw new Error(
      "Unable to analyze project with AI"
    );
  }
};


module.exports = {
  analyzeProject,
};