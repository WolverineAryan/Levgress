const OpenAI = require('openai');
const config = require('../config/env');
const logger = require('../utils/logger');
const { AppError } = require('../utils/AppError');

let groqClient = null;
let nvidiaClient = null;

if (config.groqApiKey) {
  try {
    groqClient = new OpenAI({
      apiKey: config.groqApiKey,
      baseURL: 'https://api.groq.com/openai/v1',
      timeout: 15000,
    });
    logger.info('[AI Resume] Groq client initialized for resume parser');
  } catch (error) {
    logger.error('[AI Resume] Error initializing Groq client for resume parser:', error);
  }
}

if (config.nvidiaApiKey) {
  try {
    nvidiaClient = new OpenAI({
      apiKey: config.nvidiaApiKey,
      baseURL: 'https://integrate.api.nvidia.com/v1',
      timeout: 25000,
    });
    logger.info('[AI Resume] NVIDIA NIM client initialized for resume parser');
  } catch (error) {
    logger.error('[AI Resume] Error initializing NVIDIA client for resume parser:', error);
  }
}

const callLlmForResume = async (client, modelName, prompt, engineName) => {
  const chatCompletion = await client.chat.completions.create({
    messages: [
      {
        role: 'system',
        content: 'You are an expert resume parser who extracts structured resume data and returns ONLY valid JSON objects without markdown code blocks.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    model: modelName,
    temperature: 0.1,
    max_tokens: 1800,
  });

  const content = chatCompletion.choices[0]?.message?.content?.trim() || '';
  
  // Extract JSON between first '{' and last '}'
  const firstBrace = content.indexOf('{');
  const lastBrace = content.lastIndexOf('}');
  const cleanJson = (firstBrace !== -1 && lastBrace !== -1) 
    ? content.substring(firstBrace, lastBrace + 1) 
    : content;

  const parsed = JSON.parse(cleanJson);
  logger.info(`[AI Resume] Successfully parsed resume via ${engineName} (${modelName})`);
  return parsed;
};

const filterBareDomain = (url) => {
  if (!url || typeof url !== 'string') return '';
  let trimmed = url.trim();
  if (!trimmed) return '';

  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    trimmed = `https://${trimmed}`;
  }

  try {
    const parsed = new URL(trimmed);
    const path = parsed.pathname.replace(/\/+$/, '');
    if (!path || path === '' || path === '/') {
      return '';
    }
  } catch {
    return '';
  }

  return trimmed;
};

const parseResumeText = async (resumeText) => {
  const sanitizedText = (resumeText || '').substring(0, 4000);

  const prompt = `
    Analyze the following resume text and extract key details into a structured JSON object.

    URL RULES:
    - Look for profile URLs in ALL sections of the text.
    - Extract the FULL URL including username/path (e.g. "https://github.com/johndoe" or "https://linkedin.com/in/johndoe").
    - If you find ONLY a bare root domain like "https://github.com/" with NO username or path, return an empty string "" for that field.

    Return ONLY a valid JSON object matching this schema:
    {
      "name": "Full Name",
      "bio": "A short professional 2-3 sentence bio summarizing expertise.",
      "githubUrl": "Full GitHub URL with username, or empty string",
      "linkedinUrl": "Full LinkedIn URL with username, or empty string",
      "portfolioUrl": "Full Portfolio/Website URL, or empty string",
      "techStack": ["React", "Node.js", "Python"],
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

    [RESUME TEXT]
    ${sanitizedText}
  `;

  let parsed = null;

  // 1. Try Groq (openai/gpt-oss-120b or qwen/qwen3.8-27b)
  if (groqClient) {
    try {
      const model = 'openai/gpt-oss-120b';
      parsed = await callLlmForResume(groqClient, model, prompt, 'Groq');
    } catch (err) {
      logger.warn(`[AI Resume] Groq primary attempt failed: ${err.message}. Trying Groq secondary...`);
      try {
        parsed = await callLlmForResume(groqClient, 'qwen/qwen3.8-27b', prompt, 'Groq');
      } catch (err2) {
        logger.warn(`[AI Resume] Groq secondary failed: ${err2.message}. Trying NVIDIA NIM...`);
      }
    }
  }

  // 2. Try NVIDIA NIM
  if (!parsed && nvidiaClient) {
    try {
      const model = config.nvidiaModel || 'meta/llama-3.2-11b-vision-instruct';
      parsed = await callLlmForResume(nvidiaClient, model, prompt, 'NVIDIA NIM');
    } catch (err) {
      logger.warn(`[AI Resume] NVIDIA NIM failed: ${err.message}.`);
    }
  }

  // 3. Resilient Heuristic Fallback (Never throw 500 error!)
  if (!parsed) {
    logger.warn('[AI Resume] Using intelligent regex text extraction fallback.');
    parsed = extractHeuristicResumeDetails(resumeText);
  }

  // Sanitize extracted URLs and projects
  parsed.githubUrl = filterBareDomain(parsed.githubUrl);
  parsed.linkedinUrl = filterBareDomain(parsed.linkedinUrl);
  parsed.portfolioUrl = filterBareDomain(parsed.portfolioUrl);

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
};

const extractHeuristicResumeDetails = (text) => {
  const lines = (text || '').split('\n').map(l => l.trim()).filter(Boolean);
  const name = lines[0] || 'Software Engineer';
  
  // Extract Github / LinkedIn
  const githubMatch = text.match(/https?:\/\/(www\.)?github\.com\/[a-zA-Z0-9_-]+/i);
  const linkedinMatch = text.match(/https?:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+/i);
  
  // Common skills
  const commonTech = ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Express', 'Python', 'Java', 'C++', 'MongoDB', 'PostgreSQL', 'AWS', 'Docker', 'Git', 'Next.js', 'Tailwind', 'HTML', 'CSS'];
  const techStack = commonTech.filter(t => new RegExp(`\\b${t}\\b`, 'i').test(text));

  return {
    name,
    bio: lines.slice(1, 4).join(' ').substring(0, 200) || 'Experienced software developer with strong technical and problem-solving skills.',
    githubUrl: githubMatch ? githubMatch[0] : '',
    linkedinUrl: linkedinMatch ? linkedinMatch[0] : '',
    portfolioUrl: '',
    techStack: techStack.length > 0 ? techStack : ['JavaScript', 'React', 'Node.js'],
    skills: techStack.map(t => ({ name: t, category: 'General', type: 'SKILL' })),
    projects: [],
  };
};

module.exports = {
  parseResumeText,
};
