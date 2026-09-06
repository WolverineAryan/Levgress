const OpenAI = require('openai');
const config = require('../config/env');
const logger = require('../utils/logger');

let aiClient = null;
let activeModel = 'groq/compound-mini';

if (config.nvidiaApiKey) {
  try {
    aiClient = new OpenAI({
      apiKey: config.nvidiaApiKey,
      baseURL: 'https://integrate.api.nvidia.com/v1',
    });
    activeModel = config.nvidiaModel || 'nvidia/llama-3.1-nemotron-70b-instruct';
    logger.info(`[AI Quiz] NVIDIA NIM client initialized with model: ${activeModel}`);
  } catch (error) {
    logger.error('[AI Quiz] Error initializing NVIDIA client:', error);
  }
} else if (config.groqApiKey) {
  try {
    aiClient = new OpenAI({
      apiKey: config.groqApiKey,
      baseURL: 'https://api.groq.com/openai/v1',
    });
    activeModel = config.groqModel || 'groq/compound-mini';
    logger.info(`[AI Quiz] Groq client initialized for Quiz Generation with model: ${activeModel}`);
  } catch (error) {
    logger.error('[AI Quiz] Error initializing Groq client:', error);
  }
} else {
  logger.warn('[AI Quiz] No AI API Key set.');
}

const generateTenAIQuestions = async (skillName, tier) => {
  if (aiClient) {
    try {
      const prompt = `You are a senior principal engineer creating a 10-question technical skill test for a candidate on "${skillName}" at the "${tier}" difficulty level.

Return ONLY a raw JSON array containing EXACTLY 10 question objects. Do not include markdown codeblocks (no \`\`\`json), no introductory text, no conversational text.

JSON Schema for each of the 10 objects:
{
  "question": "Detailed practical question testing ${skillName} (${tier})",
  "options": [
    "Option 1",
    "Option 2",
    "Option 3",
    "Option 4"
  ],
  "answerIndex": 0,
  "explanation": "Clear 1-2 sentence explanation of why the correct option is right"
}

Rules:
1. Generate EXACTLY 10 distinct, non-repeating questions.
2. Ensure options are realistic and distinct.
3. Randomize answerIndex between 0, 1, 2, and 3 across the 10 questions.
4. Keep questions strictly tailored to "${skillName}" at "${tier}" difficulty.`;

      const response = await aiClient.chat.completions.create({
        model: activeModel,
        messages: [
          {
            role: 'system',
            content: 'You are an expert technical examiner who outputs strictly valid JSON arrays without markdown wrappers.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 1500,
      });

      let rawContent = response.choices[0]?.message?.content?.trim() || '';
      
      // Extract JSON array robustly
      const arrayMatch = rawContent.match(/\[\s*\{[\s\S]*\}\s*\]/);
      if (arrayMatch) {
        rawContent = arrayMatch[0];
      } else {
        if (rawContent.startsWith('```json')) {
          rawContent = rawContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        } else if (rawContent.startsWith('```')) {
          rawContent = rawContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
        }
      }

      const parsed = JSON.parse(rawContent);

      if (Array.isArray(parsed) && parsed.length >= 10) {
        logger.info(`[AI Quiz] Successfully generated 10 dynamic Groq questions for ${skillName} (${tier})`);
        return parsed.slice(0, 10).map((q, idx) => ({
          question: q.question || `Q${idx + 1}. Practical ${skillName} ${tier} scenario`,
          options: Array.isArray(q.options) && q.options.length === 4 ? q.options : [
            `Option A for ${skillName}`,
            `Option B for ${skillName}`,
            `Option C for ${skillName}`,
            `Option D for ${skillName}`
          ],
          answerIndex: typeof q.answerIndex === 'number' && q.answerIndex >= 0 && q.answerIndex <= 3 ? q.answerIndex : 0,
          explanation: q.explanation || `This option represents standard best practices for ${skillName} at ${tier} level.`
        }));
      }
    } catch (err) {
      logger.error(`[AI Quiz] Groq API call failed for ${skillName} (${tier}):`, err.message);
    }
  }

  // High-quality dynamic fallback for 10 questions
  logger.warn(`[AI Quiz] Falling back to dynamic question generator for ${skillName} (${tier})`);
  return generateFallbackQuestions(skillName, tier);
};

const generateFallbackQuestions = (skillName, tier) => {
  const topics = [
    { topic: 'Core Concepts & Principles', desc: 'foundational syntax, basic primitives, and runtime execution models' },
    { topic: 'Data Handling & Operations', desc: 'data structures, state manipulation, and memory management' },
    { topic: 'Asynchronous & Event Patterns', desc: 'event loops, promises, callbacks, and non-blocking I/O' },
    { topic: 'Error Handling & Debugging', desc: 'exception catching, stack trace inspection, and logging' },
    { topic: 'Security & Input Validation', desc: 'sanitization, injection prevention, and authorization controls' },
    { topic: 'Architecture & Design Patterns', desc: 'modular organization, SOLID principles, and dependency injection' },
    { topic: 'Package & Dependency Management', desc: 'module imports, version locking, and package resolution' },
    { topic: 'Performance Optimization', desc: 'caching, lazy loading, profiling, and memory leak prevention' },
    { topic: 'Testing & Quality Assurance', desc: 'unit testing, mocking, assertion checks, and CI validation' },
    { topic: 'Deployment & Production Ops', desc: 'environment configuration, build pipelines, and production monitoring' }
  ];

  return topics.map((t, idx) => ({
    question: `Q${idx + 1}. In ${skillName} (${tier}), what is the recommended practice regarding ${t.topic.toLowerCase()}?`,
    options: [
      `Follow standard modular patterns focusing on ${t.desc} for ${skillName}`,
      `Bypassing runtime validation checks to increase execution speed`,
      `Hardcoding static global variables throughout the application codebase`,
      `Disabling error logging and system warnings in production`
    ],
    answerIndex: 0,
    explanation: `Following standard modular patterns focusing on ${t.desc} ensures scalability, security, and reliability in ${skillName}.`
  }));
};

module.exports = {
  generateTenAIQuestions,
};
