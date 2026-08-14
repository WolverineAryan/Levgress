const Groq = require('groq-sdk');
const config = require('../config/env');
const logger = require('../utils/logger');
const { AppError } = require('../utils/AppError');

let groqClient = null;
if (config.groqApiKey) {
  try {
    groqClient = new Groq({ apiKey: config.groqApiKey });
  } catch (error) {
    logger.error('Error initializing Groq client for resume parser:', error);
  }
}

const parseResumeText = async (resumeText) => {
  if (!groqClient) {
    logger.warn('Groq client not configured, falling back to mock resume details.');
    return getMockParsedDetails();
  }

  try {
    const prompt = `
      You are an expert resume parser. Analyze the following resume text and extract key details into a structured JSON object.

      URL RULES:
      - Look for profile URLs in ALL sections of the text, including any "EMBEDDED PDF LINKS" section at the bottom.
      - Extract the FULL URL including username/path (e.g. "https://github.com/johndoe" or "https://linkedin.com/in/johndoe").
      - If you find ONLY a bare root domain like "https://github.com/" or "https://linkedin.com/" with NO username or path, return an empty string "" for that field. Do NOT guess or fabricate usernames.
      - Look for URLs written as plain text anywhere in the resume (e.g. "github.com/username" in a projects section).

      Return ONLY a valid JSON object matching this schema:
      {
        "name": "Full Name",
        "bio": "A short professional 2-3 sentence bio.",
        "githubUrl": "Full GitHub URL with username, or empty string",
        "linkedinUrl": "Full LinkedIn URL with username, or empty string",
        "portfolioUrl": "Full Portfolio/Website URL, or empty string",
        "techStack": ["React", "Node.js", "etc"],
        "skills": [
          { "name": "Skill Name", "category": "Frontend|Backend|Database|DevOps|Mobile|General", "type": "SKILL" }
        ],
        "projects": [
          {
            "title": "Project Title",
            "description": "Short 1-2 sentence overview of the project",
            "githubUrl": "GitHub repo URL if present, else empty string",
            "liveUrl": "Live demo URL if present, else empty string",
            "techStack": ["React", "Node.js"]
          }
        ]
      }

      Return ONLY the raw JSON. No markdown, no explanation, no code fences.

      [RESUME TEXT]
      ${resumeText}
    `;

    const chatCompletion = await groqClient.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: config.groqModel || 'llama-3.3-70b-versatile',
      temperature: 0.1,
    });

    const content = chatCompletion.choices[0].message.content.trim();
    
    // Extract JSON between first '{' and last '}'
    const firstBrace = content.indexOf('{');
    const lastBrace = content.lastIndexOf('}');
    const cleanJson = (firstBrace !== -1 && lastBrace !== -1) 
      ? content.substring(firstBrace, lastBrace + 1) 
      : content;
    
    try {
      const parsed = JSON.parse(cleanJson);

      // Simple bare-domain filter
      const filterBareDomain = (url) => {
        if (!url || typeof url !== 'string') return '';
        let trimmed = url.trim();
        if (!trimmed) return '';

        // Add protocol if missing
        if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
          trimmed = `https://${trimmed}`;
        }

        // Strip bare root domains that have no profile path
        try {
          const parsed = new URL(trimmed);
          const path = parsed.pathname.replace(/\/+$/, '');
          if (!path || path === '' || path === '/') {
            return ''; // bare domain, no username/path
          }
        } catch {
          return ''; // invalid URL
        }

        return trimmed;
      };

      parsed.githubUrl = filterBareDomain(parsed.githubUrl);
      parsed.linkedinUrl = filterBareDomain(parsed.linkedinUrl);
      parsed.portfolioUrl = filterBareDomain(parsed.portfolioUrl);

      // Sanitize extracted projects
      if (Array.isArray(parsed.projects)) {
        parsed.projects = parsed.projects
          .filter(p => p && p.title && p.title.trim())
          .map(p => ({
            title: p.title.trim(),
            description: p.description ? p.description.trim() : '',
            githubUrl: filterBareDomain(p.githubUrl),
            liveUrl: filterBareDomain(p.liveUrl),
            techStack: Array.isArray(p.techStack) ? p.techStack.map(t => String(t).trim()).filter(Boolean) : [],
          }));
      } else {
        parsed.projects = [];
      }

      return parsed;
    } catch (parseError) {
      logger.error('Failed to parse Groq resume output as JSON:', content);
      throw new AppError('AI response format was invalid. Please try again.', 500);
    }
  } catch (error) {
    logger.error('Error during AI resume parsing:', error);
    throw new AppError('AI parsing failed. Please input details manually or retry.', 500);
  }
};

const getMockParsedDetails = () => {
  return {
    name: "Alex Mercer",
    bio: "Full Stack Engineer specializing in reactive web systems, scalable backend architectures, and developer tooling. Passionate about automated workflows.",
    githubUrl: "https://github.com/alex-mercer",
    linkedinUrl: "https://linkedin.com/in/alex-mercer",
    portfolioUrl: "https://alexmercer.dev",
    techStack: ["React", "TypeScript", "Node.js", "Express", "MongoDB", "PostgreSQL", "Docker", "Git"],
    skills: [
      { name: "RESTful API Design", category: "Backend", type: "SKILL" },
      { name: "Responsive UI Development", category: "Frontend", type: "SKILL" },
      { name: "Database Design & Optimization", category: "Database", type: "SKILL" }
    ]
  };
};

module.exports = {
  parseResumeText,
};
