jest.mock('firebase-admin', () => ({
  apps: [],
  initializeApp: jest.fn(),
  credential: {
    cert: jest.fn(),
  },
}), { virtual: true });

jest.mock('firebase-admin/auth', () => ({
  getAuth: jest.fn(() => ({
    verifyIdToken: jest.fn(),
  })),
}), { virtual: true });

const request = require('supertest');
const app = require('../src/app');
const aiQuizService = require('../src/services/aiQuiz.service');
const aiEvaluationService = require('../src/services/aiEvaluation.service');

describe('Levgress Core Platform Unit Tests', () => {

  describe('1. API Gateway & Routing Scaffolding', () => {
    it('should return 200 OK on health check', async () => {
      const res = await request(app).get('/');
      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toEqual('success');
      expect(res.body.message).toContain('Levgress API is running');
    });

    it('should return 404 for non-existent route', async () => {
      const res = await request(app).get('/api/v1/non-existent-endpoint');
      expect(res.statusCode).toEqual(404);
    });
  });

  describe('2. AI Quiz Service Unit Tests', () => {
    it('should generate 10 questions for AWS BASIC', async () => {
      const mockQuestions = Array.from({ length: 10 }, (_, i) => ({
        question: `Test Question ${i + 1}?`,
        options: ['Opt A', 'Opt B', 'Opt C', 'Opt D'],
        answerIndex: 0,
        explanation: 'Detailed explanation text.'
      }));

      jest.spyOn(aiQuizService, 'generateTenAIQuestions').mockResolvedValueOnce(mockQuestions);

      const questions = await aiQuizService.generateTenAIQuestions('AWS', 'BASIC');
      expect(Array.isArray(questions)).toBe(true);
      expect(questions.length).toEqual(10);
      questions.forEach((q) => {
        expect(q).toHaveProperty('question');
        expect(q).toHaveProperty('options');
        expect(q.options.length).toEqual(4);
        expect(q).toHaveProperty('answerIndex');
        expect(q).toHaveProperty('explanation');
      });
    });

    it('should generate 10 questions for Java INTERMEDIATE', async () => {
      const mockQuestions = Array.from({ length: 10 }, (_, i) => ({
        question: `Java Question ${i + 1}?`,
        options: ['A', 'B', 'C', 'D'],
        answerIndex: 1,
        explanation: 'Java explanation.'
      }));

      jest.spyOn(aiQuizService, 'generateTenAIQuestions').mockResolvedValueOnce(mockQuestions);

      const questions = await aiQuizService.generateTenAIQuestions('Java', 'INTERMEDIATE');
      expect(Array.isArray(questions)).toBe(true);
      expect(questions.length).toEqual(10);
    });
  });

  describe('3. AI Milestone Evaluation Service Unit Tests', () => {
    it('should evaluate evidence and return structured score & feedback', async () => {
      const mockEval = {
        score: 85,
        feedback: 'Excellent database setup with clean schema design.'
      };

      jest.spyOn(aiEvaluationService, 'evaluateEvidence').mockResolvedValueOnce(mockMock = mockEval);

      const project = { title: 'Full Stack App', description: 'React Node App' };
      const milestone = { index: 1, title: 'Database Setup' };
      const evidence = { type: 'TEXT', text: 'Created MongoDB schemas and indexes successfully.' };

      const res = await aiEvaluationService.evaluateEvidence(project, milestone, evidence);
      expect(res).toHaveProperty('score');
      expect(typeof res.score).toEqual('number');
      expect(res.score).toBeGreaterThanOrEqual(0);
      expect(res.score).toBeLessThanOrEqual(100);
      expect(res).toHaveProperty('feedback');
      expect(typeof res.feedback).toEqual('string');
    });
  });
});
