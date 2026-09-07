const OpenAI = require('openai');
const config = require('../config/env');
const logger = require('../utils/logger');

let groqClient = null;
let nvidiaClient = null;

if (config.groqApiKey) {
  try {
    groqClient = new OpenAI({
      apiKey: config.groqApiKey,
      baseURL: 'https://api.groq.com/openai/v1',
      timeout: 15000,
    });
    logger.info('[AI Quiz] Groq client initialized with model: openai/gpt-oss-120b');
  } catch (error) {
    logger.error('[AI Quiz] Error initializing Groq client:', error);
  }
}

if (config.nvidiaApiKey) {
  try {
    nvidiaClient = new OpenAI({
      apiKey: config.nvidiaApiKey,
      baseURL: 'https://integrate.api.nvidia.com/v1',
      timeout: 35000,
    });
    logger.info(`[AI Quiz] NVIDIA NIM client initialized with model: ${config.nvidiaModel || 'meta/llama-3.2-11b-vision-instruct'}`);
  } catch (error) {
    logger.error('[AI Quiz] Error initializing NVIDIA client:', error);
  }
}

const cleanQuestionText = (text) => {
  if (!text || typeof text !== 'string') return '';
  // Strip leading "Q1. ", "Q1: ", "1. ", "1: ", etc.
  return text.trim().replace(/^(Q\d+[:.]?\s*|\d+[:.]?\s*)+/i, '').trim();
};

const callLlmForQuiz = async (client, modelName, prompt, engineName) => {
  const response = await client.chat.completions.create({
    model: modelName,
    messages: [
      {
        role: 'system',
        content: 'You are an expert technical examiner. Return ONLY a valid JSON array containing EXACTLY 10 question objects. Do not wrap in markdown code blocks or add preamble.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.6,
    max_tokens: 2200,
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
    logger.info(`[AI Quiz] Successfully generated 10 dynamic questions via ${engineName} (${modelName})`);
    return parsed.slice(0, 10).map((q, idx) => ({
      question: cleanQuestionText(q.question) || `Practical scenario question ${idx + 1}`,
      options: Array.isArray(q.options) && q.options.length === 4 ? q.options.map(o => String(o).trim()) : [
        'Option A',
        'Option B',
        'Option C',
        'Option D'
      ],
      answerIndex: typeof q.answerIndex === 'number' && q.answerIndex >= 0 && q.answerIndex <= 3 ? q.answerIndex : 0,
      explanation: q.explanation ? String(q.explanation).trim() : 'Standard industry best practice.'
    }));
  }
  throw new Error('Parsed response does not contain at least 10 questions');
};

const generateTenAIQuestions = async (skillName, tier) => {
  const prompt = `Create a 10-question multiple-choice technical skill test on "${skillName}" at the "${tier}" difficulty level.

Return ONLY a raw JSON array of 10 question objects following this exact schema:
[
  {
    "question": "Clear, practical technical question testing ${skillName} (${tier})",
    "options": [
      "Option 1",
      "Option 2",
      "Option 3",
      "Option 4"
    ],
    "answerIndex": 0,
    "explanation": "Clear 1-sentence explanation of why the correct option is right"
  }
]

Rules:
1. Generate EXACTLY 10 distinct, non-repeating questions testing real code syntax, algorithms, or architecture.
2. Ensure options are realistic and distinct.
3. Randomize answerIndex across 0, 1, 2, and 3.
4. Do NOT include question number prefixes (like "Q1." or "1.") in the question string.
5. Output ONLY the raw JSON array.`;

  // 1. Try Groq with openai/gpt-oss-120b (fast, high token capacity)
  if (groqClient) {
    try {
      return await callLlmForQuiz(groqClient, 'openai/gpt-oss-120b', prompt, 'Groq');
    } catch (err) {
      logger.warn(`[AI Quiz] Groq primary attempt failed: ${err.message}. Trying Groq secondary (qwen)...`);
      try {
        return await callLlmForQuiz(groqClient, 'qwen/qwen3.8-27b', prompt, 'Groq');
      } catch (err2) {
        logger.warn(`[AI Quiz] Groq secondary failed: ${err2.message}. Trying NVIDIA NIM...`);
      }
    }
  }

  // 2. Try NVIDIA NIM (Secondary)
  if (nvidiaClient) {
    try {
      const model = config.nvidiaModel || 'meta/llama-3.2-11b-vision-instruct';
      return await callLlmForQuiz(nvidiaClient, model, prompt, 'NVIDIA NIM');
    } catch (err) {
      logger.warn(`[AI Quiz] NVIDIA NIM attempt failed: ${err.message}.`);
    }
  }

  // 3. Fallback to dynamic question generator
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

  return topics.map((t) => ({
    question: `In ${skillName} (${tier}), what is the recommended practice regarding ${t.topic.toLowerCase()}?`,
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
