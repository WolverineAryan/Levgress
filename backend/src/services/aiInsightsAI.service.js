const axios = require("axios");
const ValidationLog = require("../models/validationLog.model");

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// -----------------------------
// MAIN FUNCTION
// -----------------------------
const generateStudentAIInsights = async (studentId) => {
  const logs = await ValidationLog.find({ studentId });

  if (!logs.length) {
    return {
      summary: "No activity yet",
      strengths: [],
      weaknesses: [],
      suggestions: []
    };
  }

  // Prepare structured data
  const formatted = logs.map((log) => ({
    type: log.type,
    score: log.score
  }));

  // Call AI
  const ai = await callAI(`
You are an AI mentor analyzing student performance.

Data:
${JSON.stringify(formatted)}

Return JSON:
{
  "summary": "short paragraph",
  "strengths": [string],
  "weaknesses": [string],
  "suggestions": [string]
}
  `);

  return ai;
};

const callAI = async (prompt) => {
  try {
    const res = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a strict mentor. Return only valid JSON."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    return JSON.parse(res.data.choices[0].message.content);

  } catch (err) {
    return {
      summary: "AI analysis failed",
      strengths: [],
      weaknesses: [],
      suggestions: []
    };
  }
};