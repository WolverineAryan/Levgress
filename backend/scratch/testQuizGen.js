const config = require('../src/config/env');
const OpenAI = require('openai');

async function testNvidia() {
  console.log('--- TESTING NVIDIA meta/llama-3.2-11b-vision-instruct ---');
  const client = new OpenAI({
    apiKey: config.nvidiaApiKey,
    baseURL: 'https://integrate.api.nvidia.com/v1',
  });

  const prompt = `You are a senior principal engineer creating a 10-question technical skill test for a candidate on "React" at the "INTERMEDIATE" difficulty level.

Return ONLY a raw JSON array containing EXACTLY 10 question objects. Do not include markdown codeblocks (no \`\`\`json), no introductory text, no conversational text.

JSON Schema for each of the 10 objects:
{
  "question": "Detailed practical question testing React (INTERMEDIATE)",
  "options": [
    "Option 1",
    "Option 2",
    "Option 3",
    "Option 4"
  ],
  "answerIndex": 0,
  "explanation": "Clear 1-2 sentence explanation of why the correct option is right"
}`;

  const t0 = Date.now();
  const res = await client.chat.completions.create({
    model: 'meta/llama-3.2-11b-vision-instruct',
    messages: [
      { role: 'system', content: 'You are an expert technical examiner who outputs strictly valid JSON arrays without markdown wrappers.' },
      { role: 'user', content: prompt }
    ],
    temperature: 0.6,
    max_tokens: 2000,
  });

  console.log(`Generated in ${Date.now() - t0}ms:`);
  let content = res.choices[0].message.content.trim();
  const match = content.match(/\[\s*\{[\s\S]*\}\s*\]/);
  if (match) content = match[0];
  const parsed = JSON.parse(content);
  console.log(`Parsed ${parsed.length} questions successfully!`);
  console.log('Sample Q1:', parsed[0]);
}

testNvidia().catch(console.error);
