const { generateAIResponse } = require("./groqService");

const analyzeResume = async (resumeText) => {
  try {
    if (!resumeText || !resumeText.trim()) {
      throw new Error("Resume text is empty");
    }

    const prompt = `
Analyze this resume and return ONLY valid JSON.

IMPORTANT:
- Do not invent information.
- Extract only information present in the resume.
- If information is missing, use an empty string or empty array.
- resumeScore must be a number from 0 to 100.
- Return JSON only.

Use EXACTLY this structure:

{
  "skills": [
    "Java",
    "Python"
  ],

  "education": [
    {
      "degree": "Bachelor of Technology",
      "institution": "Example Institute",
      "year": "2022 - 2026"
    }
  ],

  "experience": [
    {
      "company": "Example Company",
      "role": "Software Developer Intern",
      "duration": "Apr 2025 - May 2025",
      "description": "Worked on backend applications and REST APIs."
    }
  ],

  "projects": [
    {
      "name": "Example Project",
      "description": "Short project description.",
      "technologies": [
        "React.js",
        "Node.js"
      ]
    }
  ],

  "certifications": [
    "Certification Name"
  ],

  "resumeScore": 80,

  "suggestions": [
    "Improve the professional summary.",
    "Add measurable achievements."
  ]
}

Resume text:

${resumeText}
`;

    const response = await generateAIResponse(prompt);

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

    // ===============================
    // NORMALIZE AI RESPONSE
    // ===============================

    const skills = Array.isArray(parsedResponse.skills)
      ? parsedResponse.skills.map(String)
      : [];

    const certifications = Array.isArray(
      parsedResponse.certifications
    )
      ? parsedResponse.certifications.map(String)
      : [];

    const suggestions = Array.isArray(
      parsedResponse.suggestions
    )
      ? parsedResponse.suggestions.map(String)
      : [];

    const education = Array.isArray(parsedResponse.education)
      ? parsedResponse.education.map((item) => {
          if (typeof item === "string") {
            return {
              degree: "",
              institution: item,
              year: "",
            };
          }

          return {
            degree: String(item?.degree || ""),
            institution: String(item?.institution || ""),
            year: String(item?.year || ""),
          };
        })
      : [];

    const experience = Array.isArray(parsedResponse.experience)
      ? parsedResponse.experience.map((item) => {
          if (typeof item === "string") {
            return {
              company: "",
              role: "",
              duration: "",
              description: item,
            };
          }

          return {
            company: String(item?.company || ""),
            role: String(item?.role || ""),
            duration: String(item?.duration || ""),
            description: String(item?.description || ""),
          };
        })
      : [];

    const projects = Array.isArray(parsedResponse.projects)
      ? parsedResponse.projects.map((item) => {
          if (typeof item === "string") {
            return {
              name: item,
              description: "",
              technologies: [],
            };
          }

          return {
            name: String(item?.name || ""),
            description: String(item?.description || ""),
            technologies: Array.isArray(item?.technologies)
              ? item.technologies.map(String)
              : [],
          };
        })
      : [];

    let resumeScore = Number(parsedResponse.resumeScore);

    if (Number.isNaN(resumeScore)) {
      resumeScore = 0;
    }

    resumeScore = Math.max(0, Math.min(100, resumeScore));

    return {
      skills,
      education,
      experience,
      projects,
      certifications,
      resumeScore,
      suggestions,
    };
  } catch (error) {
    console.error("Resume AI analysis error:", error);
    throw new Error("Unable to analyze resume with AI");
  }
};

module.exports = {
  analyzeResume,
};