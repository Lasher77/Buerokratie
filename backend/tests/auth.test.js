const request = require('supertest');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const app = require('../app');

jest.mock('../config/db', () => ({
  query: jest.fn()
}));

const db = require('../config/db');

beforeAll(() => {
  process.env.JWT_SECRET = 'testsecret';
});

describe('POST /api/auth/register', () => {
  it('registers new user and returns token', async () => {
    db.query.mockResolvedValueOnce([[]]); // check existing
    db.query.mockResolvedValueOnce([{ insertId: 1 }]); // insert

    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@example.com', password: 'secret' });

    expect(res.statusCode).toBe(201);
    expect(res.body.token).toBeDefined();
  });
});

describe('POST /api/auth/login', () => {
  it('logs in and returns token', async () => {
    const hash = await bcrypt.hash('secret', 10);
    db.query.mockResolvedValueOnce([[{ id: 1, password_hash: hash, role: 'user' }]]); // select
    db.query.mockResolvedValueOnce([{}]); // update last login

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'secret' });

    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it('rejects invalid password', async () => {
    const hash = await bcrypt.hash('secret', 10);
    db.query.mockResolvedValueOnce([[{ id: 1, password_hash: hash, role: 'user' }]]); // select

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'wrong' });

    expect(res.statusCode).toBe(401);
  });
});

describe('POST /api/auth/register-moderator', () => {
  it('allows admin to create moderator', async () => {
    const token = jwt.sign({ id: 1, role: 'admin' }, process.env.JWT_SECRET);
    db.query.mockResolvedValueOnce([[]]); // check existing
    db.query.mockResolvedValueOnce([{ insertId: 2 }]); // insert

    const res = await request(app)
      .post('/api/auth/register-moderator')
      .set('Authorization', `Bearer ${token}`)
      .send({ email: 'mod@example.com', password: 'secret' });

    expect(res.statusCode).toBe(201);
    expect(res.body.id).toBe(2);
    const lastCall = db.query.mock.calls[db.query.mock.calls.length - 1];
    expect(lastCall[1][4]).toBe('moderator');
  });

  it('rejects non-admin user', async () => {
    const token = jwt.sign({ id: 1, role: 'user' }, process.env.JWT_SECRET);
    const res = await request(app)
      .post('/api/auth/register-moderator')
      .set('Authorization', `Bearer ${token}`)
      .send({ email: 'mod@example.com', password: 'secret' });

    expect(res.statusCode).toBe(403);
  });

  it('rejects without token', async () => {
    const res = await request(app)
      .post('/api/auth/register-moderator')
      .send({ email: 'mod@example.com', password: 'secret' });

    expect(res.statusCode).toBe(401);
  });
});
