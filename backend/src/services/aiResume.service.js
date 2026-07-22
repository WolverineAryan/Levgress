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
      You are an expert resume parser and tech recruiter. Analyze the following resume text and extract the key details into a structured JSON object.
      
      The output MUST be a valid JSON object matching this schema exactly:
      {
        "name": "Full Name",
        "bio": "A short, professional 2-3 sentence summary bio suitable for a developer profile.",
        "githubUrl": "GitHub Profile URL if found, else empty string",
        "linkedinUrl": "LinkedIn Profile URL if found, else empty string",
        "portfolioUrl": "Personal Portfolio or Website URL if found, else empty string",
        "techStack": ["Array", "of", "programming languages and frameworks", "like", "React", "Node.js", "MongoDB", "Python", "etc. (Limit to top 8)"],
        "skills": [
          {
            "name": "Skill Name (e.g. RESTful API Development, Responsive Design, State Management, Database Modeling)",
            "category": "Frontend, Backend, Database, DevOps, Mobile, or General",
            "type": "SKILL"
          }
        ]
      }
      
      Do NOT return any other text, explanation, code blocks, or HTML. Return ONLY the raw JSON object string.
      
      [RESUME TEXT]
      ${resumeText}
    `;

    const chatCompletion = await groqClient.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: config.groqModel || 'llama-3.3-70b-versatile',
      temperature: 0.1, // low temperature for structured factual outputs
    });

    const content = chatCompletion.choices[0].message.content.trim();
    
    // Clean JSON string in case the LLM returned markdown code fences
    const cleanJson = content.replace(/^```json/, '').replace(/```$/, '').trim();
    
    try {
      return JSON.parse(cleanJson);
    } catch (parseError) {
      logger.error('Failed to parse Groq resume completion output as JSON:', content);
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
