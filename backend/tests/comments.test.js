const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../app');

jest.mock('../config/db', () => ({
  query: jest.fn()
}));

const db = require('../config/db');

beforeAll(() => {
  process.env.JWT_SECRET = 'testsecret';
});

describe('POST /api/reports/:id/comments', () => {
  it('allows moderator to create comment', async () => {
    const token = jwt.sign({ id: 1, role: 'moderator' }, process.env.JWT_SECRET);
    db.query.mockResolvedValueOnce([{ insertId: 1 }]);

    const res = await request(app)
      .post('/api/reports/1/comments')
      .set('Authorization', `Bearer ${token}`)
      .send({ text: 'Hallo' });

    expect(res.statusCode).toBe(201);
  });

  it('rejects user role', async () => {
    const token = jwt.sign({ id: 1, role: 'user' }, process.env.JWT_SECRET);
    const res = await request(app)
      .post('/api/reports/1/comments')
      .set('Authorization', `Bearer ${token}`)
      .send({ text: 'Hallo' });

    expect(res.statusCode).toBe(403);
  });

  it('rejects without token', async () => {
    const res = await request(app)
      .post('/api/reports/1/comments')
      .send({ text: 'Hallo' });

    expect(res.statusCode).toBe(401);
  });
});

describe('GET /api/reports/:id/comments', () => {
  it('returns comments', async () => {
    db.query.mockResolvedValueOnce([[{ id: 1, text: 'Test' }]]);

    const res = await request(app).get('/api/reports/1/comments');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([{ id: 1, text: 'Test' }]);
  });
});
