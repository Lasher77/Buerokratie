const request = require('supertest');
const app = require('../app');

jest.mock('../config/db', () => ({
  query: jest.fn()
}));

const db = require('../config/db');

describe('GET /api/categories', () => {
  it('returns list of categories', async () => {
    db.query.mockResolvedValueOnce([[{ id: 1, name: 'Test' }]]);

    const res = await request(app).get('/api/categories');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([{ id: 1, name: 'Test' }]);
  });
});
