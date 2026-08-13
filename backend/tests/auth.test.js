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

describe('API Gateway and Routing Scaffolding Tests', () => {
  it('should return 200 OK on the base health check endpoint', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toEqual(200);
    expect(res.body.status).toEqual('success');
    expect(res.body.message).toContain('Levgress API is running');
  });

  it('should return 404 for undefined endpoints', async () => {
    const res = await request(app).get('/api/v1/invalid-route-xyz');
    expect(res.statusCode).toEqual(404);
  });
});
