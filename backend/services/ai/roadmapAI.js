const { generateAIResponse } = require("./groqService");


// ======================================================
// GENERATE ROADMAP USING AI
// ======================================================

const generateRoadmap = async (
  targetRole,
  currentLevel,
  careerGoal,
  timeline
) => {
  try {
    // --------------------------------------------------
    // VALIDATION
    // --------------------------------------------------

    if (
      !targetRole ||
      typeof targetRole !== "string"
    ) {
      throw new Error("Target role is required");
    }

    targetRole = targetRole.trim();

    currentLevel =
      typeof currentLevel === "string"
        ? currentLevel.trim()
        : "";

    careerGoal =
      typeof careerGoal === "string"
        ? careerGoal.trim()
        : "";

    timeline =
      typeof timeline === "string"
        ? timeline.trim()
        : "";

    console.log("Sending roadmap request to AI... 🤖");

    // --------------------------------------------------
    // PROMPT
    // --------------------------------------------------

    const prompt = `
Create a personalized career roadmap.

Target Role:
${targetRole}

Current Level:
${currentLevel || "Not specified"}

Career Goal:
${careerGoal || "Become job-ready"}

Timeline:
${timeline || "Not specified"}

IMPORTANT RULES:

1. Return ONLY valid JSON.
2. Do not return markdown.
3. Do not return code fences.
4. Do not return explanations outside JSON.
5. Make the roadmap practical and job-oriented.
6. Include technologies, concepts, projects and interview preparation.
7. Do not invent personal experience.
8. Create a realistic roadmap based on the target role and timeline.

Return EXACTLY this JSON structure:

{
  "overview": "Short overview of the recommended career path.",

  "steps": [
    {
      "title": "Step title",
      "description": "What the candidate should learn or do.",
      "duration": "3-4 weeks",
      "topics": [
        "Topic 1",
        "Topic 2",
        "Topic 3"
      ],
      "resources": [
        "Official documentation",
        "Practice projects",
        "Coding practice"
      ]
    }
  ],

  "skillsToLearn": [
    "Skill 1",
    "Skill 2",
    "Skill 3"
  ],

  "projects": [
    "Project 1",
    "Project 2",
    "Project 3"
  ],

  "interviewPreparation": [
    "Prepare technical questions",
    "Practice coding problems",
    "Practice system design"
  ],

  "resumePreparation": [
    "Add relevant projects",
    "Highlight technical skills",
    "Add measurable achievements"
  ]
}

Create 5 to 8 roadmap steps.

Each roadmap step must contain:
- title
- description
- duration
- topics
- resources

Make the roadmap specifically relevant to:
${targetRole}

Return JSON only.
`;

    // --------------------------------------------------
    // AI REQUEST
    // --------------------------------------------------

    const response = await generateAIResponse(prompt);

    // --------------------------------------------------
    // PARSE AI RESPONSE
    // --------------------------------------------------

    let parsedResponse;

    try {
      parsedResponse = JSON.parse(response);
    } catch (error) {
      const cleanedResponse = response
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();

      parsedResponse = JSON.parse(cleanedResponse);
    }

    // --------------------------------------------------
    // NORMALIZE OVERVIEW
    // --------------------------------------------------

    const overview =
      typeof parsedResponse?.overview === "string"
        ? parsedResponse.overview
        : "";

    // --------------------------------------------------
    // NORMALIZE STEPS
    // --------------------------------------------------

    const steps = Array.isArray(
      parsedResponse?.steps
    )
      ? parsedResponse.steps.map((step) => ({
          title: String(step?.title || ""),

          description: String(
            step?.description || ""
          ),

          duration: String(
            step?.duration || ""
          ),

          topics: Array.isArray(step?.topics)
            ? step.topics.map(String)
            : [],

          resources: Array.isArray(
            step?.resources
          )
            ? step.resources.map(String)
            : [],
        }))
      : [];

    // --------------------------------------------------
    // NORMALIZE SKILLS
    // --------------------------------------------------

    const skillsToLearn = Array.isArray(
      parsedResponse?.skillsToLearn
    )
      ? parsedResponse.skillsToLearn.map(String)
      : [];

    // --------------------------------------------------
    // NORMALIZE PROJECTS
    // --------------------------------------------------

    const projects = Array.isArray(
      parsedResponse?.projects
    )
      ? parsedResponse.projects.map(String)
      : [];

    // --------------------------------------------------
    // NORMALIZE INTERVIEW PREPARATION
    // --------------------------------------------------

    const interviewPreparation =
      Array.isArray(
        parsedResponse?.interviewPreparation
      )
        ? parsedResponse.interviewPreparation.map(
            String
          )
        : [];

    // --------------------------------------------------
    // NORMALIZE RESUME PREPARATION
    // --------------------------------------------------

    const resumePreparation =
      Array.isArray(
        parsedResponse?.resumePreparation
      )
        ? parsedResponse.resumePreparation.map(
            String
          )
        : [];

    // --------------------------------------------------
    // FINAL ROADMAP
    // --------------------------------------------------

    return {
      overview,
      steps,
      skillsToLearn,
      projects,
      interviewPreparation,
      resumePreparation,
    };
  } catch (error) {
    console.error(
      "Roadmap AI generation error:",
      error
    );

    throw new Error(
      "Unable to generate roadmap with AI"
    );
  }
};


// ======================================================
// EXPORT
// ======================================================

module.exports = {
  generateRoadmap,
};