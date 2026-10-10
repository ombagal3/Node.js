const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');
require('./setup');

describe('Authentication & Security Test Suite', () => {
  const testUser = {
    name: 'Alice Johnson',
    email: 'alice@example.com',
    password: 'Password123!',
    confirmPassword: 'Password123!',
  };

  test('POST /api/auth/register - Successfully registers user with default user role', async () => {
    const res = await request(app).post('/api/auth/register').send(testUser);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(testUser.email.toLowerCase());
    expect(res.body.data.user.role).toBe('user');
    expect(res.body.data.accessToken).toBeDefined();
    // Password hash should NEVER be returned
    expect(res.body.data.user.passwordHash).toBeUndefined();
  });

  test('POST /api/auth/register - Rejects duplicate email registration', async () => {
    await request(app).post('/api/auth/register').send(testUser);
    const res = await request(app).post('/api/auth/register').send(testUser);

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  test('POST /api/auth/login - Logs in user with valid credentials', async () => {
    await request(app).post('/api/auth/register').send(testUser);

    const res = await request(app).post('/api/auth/login').send({
      email: testUser.email,
      password: testUser.password,
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.headers['set-cookie']).toBeDefined(); // Refresh token cookie set
  });

  test('POST /api/auth/login - Rejects invalid password', async () => {
    await request(app).post('/api/auth/register').send(testUser);

    const res = await request(app).post('/api/auth/login').send({
      email: testUser.email,
      password: 'WrongPassword123!',
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test('GET /api/auth/me - Rejects missing JWT access token', async () => {
    const res = await request(app).get('/api/auth/me');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test('GET /api/auth/me - Rejects invalid/malformed JWT token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer invalid.token.value');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test('Authentication - Rejects deactivated user access', async () => {
    const regRes = await request(app).post('/api/auth/register').send(testUser);
    const token = regRes.body.data.accessToken;

    // Deactivate the user in DB
    await User.findOneAndUpdate({ email: testUser.email }, { isActive: false });

    // Request protected route with active token
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/deactivated/i);

    // Try logging in as deactivated user
    const loginRes = await request(app).post('/api/auth/login').send({
      email: testUser.email,
      password: testUser.password,
    });

    expect(loginRes.status).toBe(403);
    expect(loginRes.body.message).toMatch(/deactivated/i);
  });
});
