const request = require('supertest');
const app = require('../app');

jest.mock('../config/db', () => ({
  query: jest.fn(),
}));

const db = require('../config/db');

beforeEach(() => {
  db.query.mockReset();
});

describe('POST /api/votes/:id/vote', () => {
  it('adds a vote', async () => {
    db.query.mockResolvedValueOnce([[{ id: 1 }]]); // report exists
    db.query.mockResolvedValueOnce([[]]); // no existing vote for ip/session
    db.query.mockResolvedValueOnce([{}]); // insert
    db.query.mockResolvedValueOnce([[{ count: 1 }]]); // count

    const res = await request(app).post('/api/votes/1/vote');
    expect(res.statusCode).toBe(200);
    expect(res.body.voteCount).toBe(1);
    expect(res.body.hasVoted).toBe(true);
    expect(res.body.sessionId).toBeDefined();
  });

  it('prevents duplicate votes without session header', async () => {
    db.query.mockResolvedValueOnce([[{ id: 1 }]]); // report exists
    db.query.mockResolvedValueOnce([[{ session_id: 'existing-session' }]]); // existing vote for ip/user-agent

    const res = await request(app).post('/api/votes/1/vote');

    expect(res.statusCode).toBe(409);
    expect(res.body.sessionId).toBe('existing-session');
    expect(res.body.hasVoted).toBe(true);
    expect(db.query).toHaveBeenCalledTimes(2);
  });
});

describe('DELETE /api/votes/:id/vote', () => {
  it('removes a vote', async () => {
    db.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
    db.query.mockResolvedValueOnce([[{ count: 0 }]]);

    const res = await request(app)
      .delete('/api/votes/1/vote')
      .set('x-session-id', 'abc');

    expect(res.statusCode).toBe(200);
    expect(res.body.voteCount).toBe(0);
    expect(res.body.hasVoted).toBe(false);
  });
});

describe('GET /api/votes/:id/vote-status', () => {
  it('returns vote status', async () => {
    db.query.mockResolvedValueOnce([[{ count: 2 }]]); // total
    db.query.mockResolvedValueOnce([[{ id: 1 }]]); // user vote

    const res = await request(app)
      .get('/api/votes/1/vote-status')
      .set('x-session-id', 'abc');

    expect(res.statusCode).toBe(200);
    expect(res.body.voteCount).toBe(2);
    expect(res.body.hasVoted).toBe(true);
  });
});
