const axios = require("axios");

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// -----------------------------
// MAIN ENTRY
// -----------------------------
const evaluateEvidence = async ({ type, url, milestone }) => {
  switch (type) {
    case "github":
      return await evaluateGithub(url);

    case "live":
      return await evaluateLive(url);

    case "image":
      return await evaluateImage(milestone);

    default:
      return fail("Unsupported evidence type");
  }
};

const evaluateGithub = async (repoUrl) => {
  try {
    const match = repoUrl.match(/github.com\/(.+?)\/(.+)/);
    if (!match) return fail("Invalid GitHub URL");

    const owner = match[1];
    const repo = match[2];

    const repoRes = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}`
    );

    const commitsRes = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/commits`
    );

    const commitCount = commitsRes.data.length;

    // BASE SCORE
    let baseScore = 0;
    if (commitCount > 5) baseScore += 30;
    if (repoRes.data.description) baseScore += 10;
    if (repoRes.data.stargazers_count > 0) baseScore += 10;

    // AI ANALYSIS
    const ai = await callAI(`
Evaluate this GitHub repository:

Name: ${repoRes.data.full_name}
Description: ${repoRes.data.description}
Commits: ${commitCount}

Return JSON:
{
  "score": number,
  "feedback": [string]
}
    `);

    const finalScore = Math.min(
      100,
      Math.floor((baseScore + ai.score) / 2)
    );

    return success(finalScore, ai.feedback, 0.85);

  } catch (err) {
    return fail("GitHub repo not accessible");
  }
};

const evaluateLive = async (url) => {
  try {
    const res = await axios.get(url);

    let score = 50;

    if (res.status === 200) score += 30;
    if (res.data.includes("<html")) score += 10;

    return success(score, ["Live app is accessible"], 0.7);

  } catch {
    return fail("Live project not accessible");
  }
};

const evaluateImage = async (milestone) => {
  const ai = await callAI(`
You are evaluating a student's UI screenshot.

Milestone: ${milestone}

Return JSON:
{
  "score": number,
  "feedback": [string]
}
  `);

  return success(ai.score, ai.feedback, 0.8);
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
              "You are a strict evaluator. Always return valid JSON."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.2
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
      score: 50,
      feedback: ["AI evaluation failed"]
    };
  }
};

const success = (score, feedback, confidence) => {
  return {
    score,
    verdict: score >= 70 ? "PASS" : "FAIL",
    feedback,
    confidence
  };
};

const fail = (message) => {
  return {
    score: 0,
    verdict: "FAIL",
    feedback: [message],
    confidence: 0
  };
};

module.exports = {
  evaluateEvidence
};