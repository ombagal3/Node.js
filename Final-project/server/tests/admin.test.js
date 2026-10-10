const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');
const bcrypt = require('bcryptjs');
require('./setup');

describe('Admin Management & Route Protection Test Suite', () => {
  let adminToken;
  let adminUser;
  let regularToken;
  let regularUser;

  beforeEach(async () => {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('AdminPassword123!', salt);

    adminUser = await User.create({
      name: 'Super Admin',
      email: 'admin@test.com',
      passwordHash,
      role: 'admin',
      isActive: true,
    });

    const loginRes = await request(app).post('/api/auth/login').send({
      email: 'admin@test.com',
      password: 'AdminPassword123!',
    });
    adminToken = loginRes.body.data.accessToken;

    const userRes = await request(app).post('/api/auth/register').send({
      name: 'Bob Miller',
      email: 'bob@test.com',
      password: 'BobPassword123!',
      confirmPassword: 'BobPassword123!',
    });
    regularToken = userRes.body.data.accessToken;
    regularUser = userRes.body.data.user;
  });

  test('RBAC - Regular user receives 403 Forbidden on admin routes', async () => {
    const res = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${regularToken}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  test('GET /api/admin/users - Admin can fetch paginated user list', async () => {
    const res = await request(app)
      .get('/api/admin/users?page=1&limit=10')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.pagination).toBeDefined();
    expect(res.body.pagination.totalItems).toBe(2);
  });

  test('POST /api/admin/users - Admin can create another user with specified role', async () => {
    const res = await request(app)
      .post('/api/admin/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Charlie Brown',
        email: 'charlie@test.com',
        password: 'CharliePass123!',
        role: 'user',
        isActive: true,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe('charlie@test.com');
  });

  test('PATCH /api/admin/users/:id/status - Toggles user activation', async () => {
    const res = await request(app)
      .patch(`/api/admin/users/${regularUser._id}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ isActive: false });

    expect(res.status).toBe(200);
    expect(res.body.data.user.isActive).toBe(false);
  });

  test('Safeguard - Prevents deactivating or deleting the last active administrator', async () => {
    // Attempt deactivating the only active admin
    const deactRes = await request(app)
      .patch(`/api/admin/users/${adminUser._id}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ isActive: false });

    expect(deactRes.status).toBe(400);
    expect(deactRes.body.message).toMatch(/last active administrator/i);

    // Attempt deleting the only active admin
    const deleteRes = await request(app)
      .delete(`/api/admin/users/${adminUser._id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(deleteRes.status).toBe(400);
    expect(deleteRes.body.message).toMatch(/last active administrator/i);
  });
});
