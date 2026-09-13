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


// Generate interview questions
const generateInterviewQuestions = async (
  resumeText,
  targetRole,
  interviewType,
  difficulty,
  company = ""
) => {
  try {
    if (!resumeText || !resumeText.trim()) {
      throw new Error("Resume text is empty");
    }

    if (!targetRole || !targetRole.trim()) {
      throw new Error("Target role is required");
    }

    const prompt = `
Create a realistic mock interview for the candidate.

Analyze the candidate's resume and generate interview questions
based on their actual skills, experience and projects.

Do not invent candidate experience.

Target Role:
${targetRole}

Company:
${company || "Not specified"}

Interview Type:
${interviewType}

Difficulty:
${difficulty}

Return ONLY valid JSON.

Generate exactly 10 questions.

Use EXACTLY this structure:

{
  "questions": [
    {
      "question": "Explain your experience with Java and Spring Boot.",
      "category": "technical",
      "difficulty": "medium"
    }
  ]
}

Rules:

- Generate exactly 10 questions.
- Questions must be relevant to the target role.
- Use the resume to personalize technical and project questions.
- Include a mixture of technical, behavioral, HR, situational and project questions depending on interview type.
- Do not ask questions about technologies that are completely unrelated to the resume or target role.
- difficulty must be one of: easy, medium, hard.
- category must be one of: technical, behavioral, hr, situational, project.
- Return JSON only.

CANDIDATE RESUME:

${resumeText}
`;

    console.log("Generating interview questions with AI... 🤖");

    const response = await generateAIResponse(prompt);

    const parsedResponse = parseAIResponse(response);

    const questions = Array.isArray(parsedResponse.questions)
      ? parsedResponse.questions
      : [];

    const normalizedQuestions = questions
      .slice(0, 10)
      .map((item) => ({
        question: String(item?.question || ""),
        category: [
          "technical",
          "behavioral",
          "hr",
          "situational",
          "project",
        ].includes(item?.category)
          ? item.category
          : "technical",
        difficulty: ["easy", "medium", "hard"].includes(
          item?.difficulty
        )
          ? item.difficulty
          : difficulty,
      }))
      .filter((item) => item.question.trim());

    console.log("Interview questions generated successfully ✅");

    return normalizedQuestions;
  } catch (error) {
    console.error("Interview question generation error:", error);

    throw new Error("Unable to generate interview questions with AI");
  }
};


// Evaluate a candidate's answer
const evaluateInterviewAnswer = async (
  question,
  answer,
  targetRole,
  category
) => {
  try {
    if (!question || !question.trim()) {
      throw new Error("Question is required");
    }

    if (!answer || !answer.trim()) {
      throw new Error("Answer is required");
    }

    const prompt = `
Evaluate the candidate's interview answer.

Target Role:
${targetRole}

Question Category:
${category}

Question:
${question}

Candidate Answer:
${answer}

Return ONLY valid JSON.

Use EXACTLY this structure:

{
  "score": 85,
  "feedback": "The answer demonstrates a good understanding of the topic.",
  "strengths": [
    "Clear explanation",
    "Good technical understanding"
  ],
  "improvements": [
    "Add a real project example",
    "Explain the implementation in more detail"
  ]
}

Rules:

- score must be a number from 0 to 100.
- feedback must be concise and useful.
- strengths must contain specific positive points.
- improvements must contain specific actionable improvements.
- Evaluate only the provided answer.
- Do not invent facts.
- Return JSON only.
`;

    console.log("Evaluating interview answer with AI... 🤖");

    const response = await generateAIResponse(prompt);

    const parsedResponse = parseAIResponse(response);

    let score = Number(parsedResponse.score);

    if (Number.isNaN(score)) {
      score = 0;
    }

    score = Math.max(0, Math.min(100, score));

    const feedback = String(
      parsedResponse.feedback || ""
    );

    const strengths = Array.isArray(parsedResponse.strengths)
      ? parsedResponse.strengths.map(String)
      : [];

    const improvements = Array.isArray(
      parsedResponse.improvements
    )
      ? parsedResponse.improvements.map(String)
      : [];

    console.log("Interview answer evaluation completed ✅");

    return {
      score,
      feedback,
      strengths,
      improvements,
    };
  } catch (error) {
    console.error("Interview answer evaluation error:", error);

    throw new Error("Unable to evaluate interview answer with AI");
  }
};


module.exports = {
  generateInterviewQuestions,
  evaluateInterviewAnswer,
};