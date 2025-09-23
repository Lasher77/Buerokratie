const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../app');

jest.mock('../config/db', () => ({
  query: jest.fn(),
}));

const db = require('../config/db');

const basePublicReport = {
  id: 1,
  title: 'Test',
  description: 'Desc',
  category_id: 1,
  category_name: 'Cat',
  time_spent: null,
  costs: null,
  affected_employees: null,
  wz_category_key: 'A',
  is_anonymous: false,
  status: 'pending',
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: null,
  vote_count: 0,
  has_comments: 0
};

beforeAll(() => {
  process.env.JWT_SECRET = 'testsecret';
});

beforeEach(() => {
  db.query.mockReset();
});

describe('POST /api/reports', () => {
  it('creates a new report and hides contact data', async () => {
    db.query.mockResolvedValueOnce([[{ id: 1 }]]); // category exists
    db.query.mockResolvedValueOnce([{ insertId: 42 }]); // insert
    db.query.mockResolvedValueOnce([[{ ...basePublicReport, id: 42 }]]); // fetch public fields

    const res = await request(app).post('/api/reports').send({
      title: 'Test',
      description: 'Desc',
      category_id: 1,
      wz_category_key: 'a'
    });

    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({ ...basePublicReport, id: 42 });
    expect(res.body.reporter_email).toBeUndefined();
    expect(db.query.mock.calls[1][1][9]).toBe('A');
  });
});

describe('GET /api/reports', () => {
  it('returns list of sanitized reports', async () => {
    db.query.mockResolvedValueOnce([[basePublicReport]]);

    const res = await request(app).get('/api/reports');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([basePublicReport]);
    expect(res.body[0].reporter_name).toBeUndefined();
  });
});

describe('GET /api/reports/:id', () => {
  it('returns single sanitized report', async () => {
    db.query.mockResolvedValueOnce([[basePublicReport]]);

    const res = await request(app).get('/api/reports/1');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(basePublicReport);
    expect(res.body.reporter_company).toBeUndefined();
  });
});

describe('GET /api/reports/:id/confidential', () => {
  it('requires authentication', async () => {
    const res = await request(app).get('/api/reports/1/confidential');
    expect(res.statusCode).toBe(401);
  });

  it('returns confidential details for moderators', async () => {
    const token = jwt.sign({ id: 5, role: 'moderator' }, process.env.JWT_SECRET);
    const confidentialReport = {
      ...basePublicReport,
      reporter_name: 'Max Mustermann',
      reporter_company: 'Beispiel GmbH',
      reporter_email: 'max@example.com'
    };
    db.query.mockResolvedValueOnce([[confidentialReport]]);

    const res = await request(app)
      .get('/api/reports/1/confidential')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.reporter_email).toBe('max@example.com');
    expect(res.body).toMatchObject({
      reporter_name: 'Max Mustermann',
      reporter_company: 'Beispiel GmbH',
      reporter_email: 'max@example.com'
    });
  });
});
