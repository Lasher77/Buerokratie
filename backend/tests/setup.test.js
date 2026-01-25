const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../app');

jest.mock('../config/db', () => ({
  query: jest.fn()
}));

const db = require('../config/db');

beforeAll(() => {
  process.env.JWT_SECRET = 'testsecret';
  process.env.JWT_EXPIRES_IN = '1h';
});

beforeEach(() => {
  db.query.mockReset();
});

describe('GET /api/setup/status', () => {
  it('returns needsSetup: true when no admins exist', async () => {
    db.query.mockResolvedValueOnce([[{ count: 0 }]]);

    const res = await request(app).get('/api/setup/status');

    expect(res.statusCode).toBe(200);
    expect(res.body.needsSetup).toBe(true);
    expect(res.body.message).toContain('Kein Administrator');
  });

  it('returns needsSetup: false when admin exists', async () => {
    db.query.mockResolvedValueOnce([[{ count: 1 }]]);

    const res = await request(app).get('/api/setup/status');

    expect(res.statusCode).toBe(200);
    expect(res.body.needsSetup).toBe(false);
    expect(res.body.message).toContain('initialisiert');
  });
});

describe('POST /api/setup/admin', () => {
  it('creates first admin when no admins exist', async () => {
    db.query.mockResolvedValueOnce([[{ count: 0 }]]); // check admin count
    db.query.mockResolvedValueOnce([[]]); // check email exists
    db.query.mockResolvedValueOnce([{ insertId: 1 }]); // insert admin

    const res = await request(app)
      .post('/api/setup/admin')
      .send({
        email: 'admin@example.com',
        password: 'SecurePass1',
        name: 'Test Admin'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.message).toContain('erfolgreich erstellt');

    // Verify token contains admin role
    const decoded = jwt.decode(res.body.token);
    expect(decoded.role).toBe('admin');
    expect(decoded.id).toBe(1);
  });

  it('rejects setup when admin already exists', async () => {
    db.query.mockResolvedValueOnce([[{ count: 1 }]]); // admin exists

    const res = await request(app)
      .post('/api/setup/admin')
      .send({
        email: 'admin@example.com',
        password: 'SecurePass1'
      });

    expect(res.statusCode).toBe(403);
    expect(res.body.message).toContain('bereits abgeschlossen');
  });

  it('validates password requirements', async () => {
    db.query.mockResolvedValueOnce([[{ count: 0 }]]);

    // Too short
    let res = await request(app)
      .post('/api/setup/admin')
      .send({
        email: 'admin@example.com',
        password: 'Short1'
      });
    expect(res.statusCode).toBe(400);

    // No uppercase
    res = await request(app)
      .post('/api/setup/admin')
      .send({
        email: 'admin@example.com',
        password: 'nouppercase1'
      });
    expect(res.statusCode).toBe(400);

    // No number
    res = await request(app)
      .post('/api/setup/admin')
      .send({
        email: 'admin@example.com',
        password: 'NoNumberHere'
      });
    expect(res.statusCode).toBe(400);
  });

  it('validates email format', async () => {
    const res = await request(app)
      .post('/api/setup/admin')
      .send({
        email: 'not-an-email',
        password: 'SecurePass1'
      });

    expect(res.statusCode).toBe(400);
  });

  it('rejects duplicate email', async () => {
    db.query.mockResolvedValueOnce([[{ count: 0 }]]); // no admin exists
    db.query.mockResolvedValueOnce([[{ id: 1 }]]); // email already used

    const res = await request(app)
      .post('/api/setup/admin')
      .send({
        email: 'existing@example.com',
        password: 'SecurePass1'
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toContain('bereits registriert');
  });
});
