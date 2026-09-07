const config = require('../src/config/env');
const OpenAI = require('openai');

const client = new OpenAI({
  apiKey: config.nvidiaApiKey,
  baseURL: 'https://integrate.api.nvidia.com/v1',
  timeout: 8000,
});

async function main() {
  const modelsRes = await client.models.list();
  const allModels = modelsRes.data.map(m => m.id);
  console.log(`Found ${allModels.length} models. Testing active ones...`);

  const working = [];
  for (const model of allModels) {
    // skip embed and vision/guard models
    if (model.includes('embed') || model.includes('guard') || model.includes('clip') || model.includes('detector') || model.includes('reward')) continue;

    try {
      const res = await client.chat.completions.create({
        model,
        messages: [{ role: 'user', content: 'Say OK' }],
        max_tokens: 5,
      });
      console.log(`[WORKING] -> ${model} : ${res.choices[0]?.message?.content?.trim()}`);
      working.push(model);
    } catch (err) {
      // ignore 404 / 410
    }
  }

  console.log('\n--- ALL WORKING MODELS ---');
  console.log(JSON.stringify(working, null, 2));
}

main().catch(console.error);
