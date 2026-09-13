const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const generateAIResponse = async (prompt) => {
  try {
    const completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-20b",

      messages: [
        {
          role: "system",
          content: `
You are an expert AI assistant.

You MUST return ONLY a valid JSON object.

Do not return markdown.
Do not return code fences.
Do not return explanations.
Do not return any text before or after the JSON.

Follow the exact JSON structure requested in the user's prompt.
Do not add unnecessary fields.
`,
        },
        {
          role: "user",
          content: prompt,
        },
      ],

      temperature: 0.1,

      response_format: {
        type: "json_object",
      },
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error("Groq AI error:", error);
    throw new Error("Unable to generate AI response");
  }
};

module.exports = {
  generateAIResponse,
};