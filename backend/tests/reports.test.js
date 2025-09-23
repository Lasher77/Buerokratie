const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../app');

jest.mock('../config/db', () => ({
  query: jest.fn(),
}));

const db = require('../config/db');

const baseApprovedReport = {
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
  status: 'approved',
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: null,
  vote_count: 0,
  has_comments: 0
};

const basePendingReport = {
  ...baseApprovedReport,
  status: 'pending'
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
    db.query.mockResolvedValueOnce([[{ ...basePendingReport, id: 42 }]]); // fetch pending report

    const res = await request(app).post('/api/reports').send({
      title: 'Test',
      description: 'Desc',
      category_id: 1,
      wz_category_key: 'a'
    });

    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({ ...basePendingReport, id: 42 });
    expect(res.body.reporter_email).toBeUndefined();
    expect(db.query.mock.calls[1][1][9]).toBe('A');
    expect(db.query.mock.calls[1][1][11]).toBe('pending');
  });
});

describe('GET /api/reports', () => {
  it('returns list of sanitized reports', async () => {
    db.query.mockResolvedValueOnce([[baseApprovedReport]]);

    const res = await request(app).get('/api/reports');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([baseApprovedReport]);
    expect(res.body[0].reporter_name).toBeUndefined();
  });

  it('queries only approved reports', async () => {
    db.query.mockResolvedValueOnce([[baseApprovedReport]]);

    await request(app).get('/api/reports');
    expect(db.query.mock.calls[0][0]).toContain("WHERE r.status = 'approved'");
  });
});

describe('GET /api/reports/:id', () => {
  it('returns single sanitized report', async () => {
    db.query.mockResolvedValueOnce([[baseApprovedReport]]);

    const res = await request(app).get('/api/reports/1');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(baseApprovedReport);
    expect(res.body.reporter_company).toBeUndefined();
  });

  it('queries only approved report by id', async () => {
    db.query.mockResolvedValueOnce([[baseApprovedReport]]);

    await request(app).get('/api/reports/1');
    expect(db.query.mock.calls[0][0]).toContain("WHERE r.id = ? AND r.status = 'approved'");
    expect(db.query.mock.calls[0][1]).toEqual(['1']);
  });

  it('returns 404 for non-approved reports', async () => {
    db.query.mockResolvedValueOnce([[]]);

    const res = await request(app).get('/api/reports/1');
    expect(res.statusCode).toBe(404);
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
      ...baseApprovedReport,
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

describe('GET /api/reports/category/:categoryId', () => {
  it('filters by category and approved status', async () => {
    db.query.mockResolvedValueOnce([[baseApprovedReport]]);

    await request(app).get('/api/reports/category/1');
    expect(db.query.mock.calls[0][0]).toContain("WHERE r.category_id = ? AND r.status = 'approved'");
    expect(db.query.mock.calls[0][1]).toEqual(['1']);
  });
});

describe('GET /api/reports/search/:query', () => {
  it('searches only approved reports', async () => {
    db.query.mockResolvedValueOnce([[baseApprovedReport]]);

    await request(app).get('/api/reports/search/test');
    expect(db.query.mock.calls[0][0]).toContain("WHERE (r.title LIKE ? OR r.description LIKE ?) AND r.status = 'approved'");
    expect(db.query.mock.calls[0][1]).toEqual(['%test%', '%test%']);
  });
});
