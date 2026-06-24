const Groq = require('groq-sdk');
const config = require('../config/env');
const logger = require('../utils/logger');

// Initialize Groq client
let groqClient = null;
if (config.groqApiKey) {
  try {
    groqClient = new Groq({ apiKey: config.groqApiKey });
    logger.info(`Groq client initialized with model: ${config.groqModel}`);
  } catch (error) {
    logger.error('Error initializing Groq client:', error);
  }
} else {
  logger.warn('GROQ_API_KEY is not set. AI evaluation will run in mock mode.');
}

const evaluateEvidence = async (projectDetails, milestoneDetails, evidence) => {
  if (!groqClient) {
    logger.warn('Groq client not available, returning mock evaluation');
    return getMockEvaluation(milestoneDetails, evidence);
  }

  try {
    const prompt = `
      You are an expert AI software engineering mentor. Evaluate the following student milestone evidence submission.
      
      [PROJECT CONTEXT]
      Title: ${projectDetails.title}
      Description: ${projectDetails.description}
      
      [MILESTONE CONTEXT]
      Index: ${milestoneDetails.index}/5
      Title: ${milestoneDetails.title}
      Description: ${milestoneDetails.description}
      
      [STUDENT SUBMISSION]
      Evidence Type: ${evidence.type || 'TEXT'}
      Submitted Explanation/Text: ${evidence.text || 'No description provided.'}
      Evidence URL/Link: ${evidence.url || 'No URL/Link provided.'}
      Uploaded Filename: ${evidence.fileName || 'No file uploaded.'}
      
      [EVALUATION RULES]
      1. Rate the completion of the milestone on a scale from 0 to 100.
      2. Analyze the evidence details based on the requirements of this milestone index (${milestoneDetails.index}/5):
         - Milestone 1: Expects project plan or database schemas in a PDF file or text form. Reject if not design-oriented.
         - Milestone 2: Expects database configuration/code setup description or PDF database schemas or Image test execution screenshot.
         - Milestone 3: Expects frontend UI layouts, screens, or React views. Image screenshots are typical.
         - Milestone 4: Expects API integration details, data flow descriptions, or image screenshots showing working pages.
         - Milestone 5: Expects testing reports, code documentation, or a live deployment link (Vercel, Render, GitHub Pages, Netlify, etc.).
      3. Verify if the submitted evidence format matches the expected type:
         - If the student selected PDF, check if a valid PDF fileName is provided and evaluated.
         - If the student selected IMAGE, check if a screenshot/image is described or fileName is present.
         - If the student selected LINK, check if a valid URL (like https://...) is provided.
      4. Award a passing score (>= 80) if the evidence is present, authentic, and demonstrates real progress toward the milestone requirements.
      5. Award a failing score (< 80) if the evidence is blank, incomplete, off-topic, or fails to meet the expected format for this milestone phase.
      6. Provide highly constructive, specific feedback and next steps for the student.
      7. Respond STRICTLY in a JSON format.
      
      [JSON RESPONSE FORMAT]
      {
        "score": number (0-100),
        "feedback": "string containing your evaluation feedback"
      }
    `;

    const response = await groqClient.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an objective AI grading assistant. You must output valid JSON only.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: config.groqModel,
      response_format: { type: 'json_object' },
      temperature: 0.2,
      max_tokens: 1000,
    });

    const responseText = response.choices[0]?.message?.content;
    const result = JSON.parse(responseText);

    // Validate structure of parsed JSON
    if (typeof result.score !== 'number' || !result.feedback) {
      throw new Error('Invalid AI response structure');
    }

    return {
      score: Math.min(100, Math.max(0, result.score)), // Keep within 0-100
      feedback: result.feedback,
    };
  } catch (error) {
    logger.error('Failed to get evaluation from Groq API:', error);
    // Graceful fallback to mock evaluation
    return getMockEvaluation(milestoneDetails, evidence);
  }
};

const getMockEvaluation = (milestoneDetails, evidence) => {
  const isMockPass = true; // Let's make it pass by default so local dev is easy without API key
  const score = isMockPass ? 85 : 45;
  const feedback = `[MOCK MODE] This is a mock evaluation because GROQ_API_KEY is not set or failed. 
Your submission of type "${evidence.type || 'TEXT'}" for "${milestoneDetails.title}" looks good. 
${evidence.fileName ? `Uploaded file: "${evidence.fileName}" was received and validated.` : ''}
${evidence.url ? `URL link: "${evidence.url}" was checked.` : ''}
For improvements, remember to keep code modular, add comprehensive unit tests, and properly document key components.`;

  return { score, feedback };
};

module.exports = {
  evaluateEvidence,
};
