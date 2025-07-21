const request = require('supertest');
const app = require('../app');

jest.mock('../config/db', () => ({
  query: jest.fn(),
}));

const db = require('../config/db');

describe('CORS headers', () => {
  it('includes Access-Control-Allow-Origin header', async () => {
    db.query.mockResolvedValueOnce([[]]);
    const res = await request(app).get('/api/reports');
    expect(res.headers['access-control-allow-origin']).toBeDefined();
  });
});
