const axios = require("axios");

const GROQ_API_KEY = process.env.GROQ_API_KEY;

/* ===============================
   MAIN ENTRY FUNCTION
================================ */
const evaluateEvidence = async ({ type, url, milestone, projectTitle, projectDescription }) => {
  
   if (milestone === "Development" && type !== "github") {
    return fail("Development requires GitHub repository");
  }

  else if (milestone === "Deployment" && type !== "live") {
    return fail("Deployment requires live URL");
  }

  else if (milestone === "UI / Design" && type !== "image") {
    return fail("UI milestone requires image proof");
  }

  switch (type) {
    case "github":
      return await evaluateGithub(url);

    case "live":
      return await evaluateLive(url);

    case "image":
      return await evaluateImage({ milestone, projectTitle, projectDescription });

    default:
      return fail("Unsupported evidence type");
  }
};

/* ===============================
   GITHUB EVALUATION
================================ */
const evaluateGithub = async (repoUrl) => {
  try {
    const match = repoUrl.match(/github.com\/(.+?)\/(.+)/);
    if (!match) return fail("Invalid GitHub URL");

    const owner = match[1];
    const repo = match[2];

    const repoRes = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}`
    );

    let commitCount = 0;

    try {
      const commitsRes = await axios.get(
        `https://api.github.com/repos/${owner}/${repo}/commits`
      );
      commitCount = commitsRes.data.length;
    } catch {
      commitCount = 1;
    }

    const ai = await callAI(`
Evaluate this GitHub project.

Name: ${repoRes.data.full_name}
Description: ${repoRes.data.description}
Stars: ${repoRes.data.stargazers_count}
Commits: ${commitCount}

Return JSON:
{
  "score": number,
  "feedback": ["improvement 1", "improvement 2"]
}
`);

    return success(ai.score || 70, ai.feedback, 0.9);

  } catch (err) {
    return fail("GitHub repo not accessible");
  }
};

/* ===============================
   LIVE PROJECT
================================ */
const evaluateLive = async (url) => {
  try {
    let status = 200;

    try {
      const res = await axios.get(url, { timeout: 5000 });
      status = res.status;
    } catch {
      status = 200;
    }

    const ai = await callAI(`
Evaluate this live project: ${url}

Return JSON:
{
  "score": number,
  "feedback": ["usability", "design", "issues"]
}
`);

    return success(ai.score || 70, ai.feedback, 0.8);

  } catch {
    return fail("Live project validation failed");
  }
};

/* ===============================
   IMAGE (TEMP BASIC)
================================ */
const evaluateImage = async ({
  milestone,
  projectTitle,
  projectDescription
}) => {

  if (milestone !== "UI / Design") {
    return fail("Image only allowed for UI/Design milestone");
  }

  const ai = await callAI(`
Project: ${projectTitle}
Description: ${projectDescription}

Student submitted UI screenshot.

Check:
- Does this make sense for UI milestone?
- Is it likely a real UI or random image?

Return JSON:
{
  "score": number,
  "feedback": ["issues"],
  "valid": true or false
}
`);

  if (!ai.valid || ai.score < 60) {
    return fail("Invalid UI evidence");
  }

  return success(ai.score, ai.feedback, 0.8);
};

/* ===============================
   GROQ AI CALL
================================ */
const callAI = async (prompt) => {
  try {
    const res = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama3-8b-8192",
        messages: [
          {
            role: "system",
            content: "Return only valid JSON."
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
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const content = res.data.choices[0].message.content;

    return JSON.parse(content);

  } catch (err) {
    console.error("GROQ ERROR:", err.response?.data || err.message);

    return {
      score: 60,
      feedback: ["AI fallback response"]
    };
  }
};

/* ===============================
   HELPERS
================================ */
const success = (score, feedback, confidence) => ({
  score,
  verdict: score >= 70 ? "PASS" : "FAIL",
  feedback,
  confidence
});

const fail = (message) => ({
  score: 0,
  verdict: "FAIL",
  feedback: [message],
  confidence: 0
});

/* ===============================
   EXPORT
================================ */
module.exports = {
  evaluateEvidence
};