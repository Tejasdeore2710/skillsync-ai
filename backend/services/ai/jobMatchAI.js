const { generateAIResponse } = require("./groqService");

const analyzeJobMatch = async (resumeText, jobDescription) => {
  try {
    if (!resumeText || !resumeText.trim()) {
      throw new Error("Resume text is empty");
    }

    if (!jobDescription || !jobDescription.trim()) {
      throw new Error("Job description is empty");
    }

    const prompt = `
Analyze how well this resume matches the given job description.

Return ONLY valid JSON.

IMPORTANT:
- Do not invent information.
- Use only information present in the resume and job description.
- matchScore must be a number from 0 to 100.
- matchedSkills must contain skills present in both the resume and job requirements.
- missingSkills must contain important skills required by the job but not clearly present in the resume.
- strengths should describe why the candidate matches the job.
- weaknesses should describe important gaps or weaknesses.
- recommendations should give practical suggestions to improve the candidate's match.
- Return JSON only.
- Do not use markdown.
- Do not use code fences.

Use EXACTLY this structure:

{
  "matchScore": 80,

  "matchedSkills": [
    "Java",
    "Spring Boot",
    "SQL"
  ],

  "missingSkills": [
    "Docker",
    "AWS"
  ],

  "strengths": [
    "Strong Java backend experience",
    "Good knowledge of REST APIs"
  ],

  "weaknesses": [
    "Limited cloud experience",
    "No clear Docker experience"
  ],

  "recommendations": [
    "Learn Docker fundamentals",
    "Add AWS projects to the resume"
  ]
}

RESUME:

${resumeText}

JOB DESCRIPTION:

${jobDescription}
`;

    console.log("Sending resume and job description to AI... 🤖");

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

    let matchScore = Number(parsedResponse.matchScore);

    if (Number.isNaN(matchScore)) {
      matchScore = 0;
    }

    matchScore = Math.max(0, Math.min(100, matchScore));

    const matchedSkills = Array.isArray(parsedResponse.matchedSkills)
      ? parsedResponse.matchedSkills.map(String)
      : [];

    const missingSkills = Array.isArray(parsedResponse.missingSkills)
      ? parsedResponse.missingSkills.map(String)
      : [];

    const strengths = Array.isArray(parsedResponse.strengths)
      ? parsedResponse.strengths.map(String)
      : [];

    const weaknesses = Array.isArray(parsedResponse.weaknesses)
      ? parsedResponse.weaknesses.map(String)
      : [];

    const recommendations = Array.isArray(
      parsedResponse.recommendations
    )
      ? parsedResponse.recommendations.map(String)
      : [];

    console.log("Job match AI analysis completed ✅");

    return {
      matchScore,
      matchedSkills,
      missingSkills,
      strengths,
      weaknesses,
      recommendations,
    };
  } catch (error) {
    console.error("Job Match AI analysis error:", error);

    throw new Error("Unable to analyze job match with AI");
  }
};

module.exports = {
  analyzeJobMatch,
};