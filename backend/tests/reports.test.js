const request = require('supertest');
const app = require('../app');

jest.mock('../config/db', () => ({
  query: jest.fn(),
}));

const db = require('../config/db');

describe('POST /api/reports', () => {
  it('creates a new report', async () => {
    db.query.mockResolvedValueOnce([[{ id: 1 }]]); // category exists
    db.query.mockResolvedValueOnce([{ insertId: 42 }]); // insert
    db.query.mockResolvedValueOnce([[{ id: 42, title: 'Test', description: 'Desc', category_name: 'Cat', wz_category_key: 'A' }]]); // fetch

    const res = await request(app).post('/api/reports').send({
      title: 'Test',
      description: 'Desc',
      category_id: 1,
      wz_category_key: 'a'
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.id).toBe(42);
    expect(db.query.mock.calls[1][1][9]).toBe('A');
  });
});

describe('GET /api/reports', () => {
  it('returns list of reports', async () => {
    db.query.mockResolvedValueOnce([[{ id: 1, title: 'Test', wz_category_key: 'A' }]]);

    const res = await request(app).get('/api/reports');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([{ id: 1, title: 'Test', wz_category_key: 'A' }]);
  });
});

describe('GET /api/reports/:id', () => {
  it('returns single report', async () => {
    db.query.mockResolvedValueOnce([[{ id: 1, title: 'Test', wz_category_key: 'A' }]]);

    const res = await request(app).get('/api/reports/1');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ id: 1, title: 'Test', wz_category_key: 'A' });
  });
});
