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

  it('keeps zero values for numeric fields', async () => {
    db.query.mockResolvedValueOnce([[{ id: 1 }]]);
    db.query.mockResolvedValueOnce([{ insertId: 43 }]);
    const zeroReport = {
      ...basePendingReport,
      id: 43,
      time_spent: 0,
      costs: 0,
      affected_employees: 0
    };
    db.query.mockResolvedValueOnce([[zeroReport]]);

    const res = await request(app).post('/api/reports').send({
      title: 'Test',
      description: 'Desc',
      category_id: 1,
      time_spent: 0,
      costs: 0,
      affected_employees: 0,
      wz_category_key: 'A'
    });

    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual(zeroReport);
    const insertParams = db.query.mock.calls[1][1];
    expect(insertParams[3]).toBe(0);
    expect(insertParams[4]).toBe(0);
    expect(insertParams[5]).toBe(0);
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

describe('GET /api/reports/pending', () => {
  it('requires moderator authentication', async () => {
    const res = await request(app).get('/api/reports/pending');
    expect(res.statusCode).toBe(401);
  });

  it('rejects non-moderator users', async () => {
    const token = jwt.sign({ id: 2, role: 'user' }, process.env.JWT_SECRET);

    const res = await request(app)
      .get('/api/reports/pending')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(403);
  });

  it('returns all reports for moderators without status filter', async () => {
    const token = jwt.sign({ id: 3, role: 'moderator' }, process.env.JWT_SECRET);
    const reportRows = [baseApprovedReport, basePendingReport];
    db.query.mockResolvedValueOnce([reportRows]);

    const res = await request(app)
      .get('/api/reports/pending')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(reportRows);
    expect(db.query.mock.calls[0][0]).not.toContain("WHERE r.status = 'approved'");
  });
});

describe('PATCH /api/reports/:id/status', () => {
  it('toggles status from pending to approved for moderators', async () => {
    const token = jwt.sign({ id: 10, role: 'moderator' }, process.env.JWT_SECRET);
    const updatedReport = { ...baseApprovedReport, id: 5 };

    db.query
      .mockResolvedValueOnce([[{ status: 'pending' }]])
      .mockResolvedValueOnce([{ affectedRows: 1 }])
      .mockResolvedValueOnce([[updatedReport]]);

    const res = await request(app)
      .patch('/api/reports/5/status')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(updatedReport);
    expect(db.query.mock.calls[1][0]).toContain('UPDATE reports SET status = ?');
    expect(db.query.mock.calls[1][1]).toEqual(['approved', '5']);
  });

  it('allows admins to toggle status from approved to pending', async () => {
    const token = jwt.sign({ id: 11, role: 'admin' }, process.env.JWT_SECRET);
    const updatedReport = { ...basePendingReport, id: 6 };

    db.query
      .mockResolvedValueOnce([[{ status: 'approved' }]])
      .mockResolvedValueOnce([{ affectedRows: 1 }])
      .mockResolvedValueOnce([[updatedReport]]);

    const res = await request(app)
      .patch('/api/reports/6/status')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(updatedReport);
    expect(db.query.mock.calls[1][1]).toEqual(['pending', '6']);
  });

  it('rejects anonymous status changes', async () => {
    const res = await request(app).patch('/api/reports/1/status');

    expect(res.statusCode).toBe(401);
    expect(db.query).not.toHaveBeenCalled();
  });

  it('rejects normal users', async () => {
    const token = jwt.sign({ id: 12, role: 'user' }, process.env.JWT_SECRET);

    const res = await request(app)
      .patch('/api/reports/1/status')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(403);
    expect(db.query).not.toHaveBeenCalled();
  });

  it('returns 404 for non-existent reports', async () => {
    const token = jwt.sign({ id: 13, role: 'moderator' }, process.env.JWT_SECRET);

    db.query.mockResolvedValueOnce([[]]);

    const res = await request(app)
      .patch('/api/reports/999/status')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(404);
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
