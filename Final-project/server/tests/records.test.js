const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');
const Record = require('../src/models/Record');
const bcrypt = require('bcryptjs');
require('./setup');

describe('Record Management & Access Control Test Suite', () => {
  let adminToken;
  let adminUser;
  let user1Token;
  let user1;
  let user2Token;
  let user2;

  beforeEach(async () => {
    const salt = await bcrypt.genSalt(10);

    adminUser = await User.create({
      name: 'Admin Boss',
      email: 'admin@boss.com',
      passwordHash: await bcrypt.hash('AdminPass123!', salt),
      role: 'admin',
      isActive: true,
    });
    const adminLogin = await request(app).post('/api/auth/login').send({
      email: 'admin@boss.com',
      password: 'AdminPass123!',
    });
    adminToken = adminLogin.body.data.accessToken;

    const u1Res = await request(app).post('/api/auth/register').send({
      name: 'User One',
      email: 'user1@test.com',
      password: 'UserOne123!',
      confirmPassword: 'UserOne123!',
    });
    user1Token = u1Res.body.data.accessToken;
    user1 = u1Res.body.data.user;

    const u2Res = await request(app).post('/api/auth/register').send({
      name: 'User Two',
      email: 'user2@test.com',
      password: 'UserTwo123!',
      confirmPassword: 'UserTwo123!',
    });
    user2Token = u2Res.body.data.accessToken;
    user2 = u2Res.body.data.user;
  });

  test('User personal record CRUD flow', async () => {
    // 1. Create own record
    const createRes = await request(app)
      .post('/api/records/my')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        title: 'User 1 Personal Notes',
        description: 'Private research and development notes',
        category: 'Engineering',
        status: 'Draft',
        priority: 'High',
      });

    expect(createRes.status).toBe(201);
    const recordId = createRes.body.data.record._id;

    // 2. Fetch own record
    const getRes = await request(app)
      .get(`/api/records/my/${recordId}`)
      .set('Authorization', `Bearer ${user1Token}`);

    expect(getRes.status).toBe(200);
    expect(getRes.body.data.record.title).toBe('User 1 Personal Notes');

    // 3. Update own record
    const updateRes = await request(app)
      .patch(`/api/records/my/${recordId}`)
      .set('Authorization', `Bearer ${user1Token}`)
      .send({ title: 'Updated User 1 Notes' });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.data.record.title).toBe('Updated User 1 Notes');

    // 4. Delete own record
    const delRes = await request(app)
      .delete(`/api/records/my/${recordId}`)
      .set('Authorization', `Bearer ${user1Token}`);

    expect(delRes.status).toBe(200);
  });

  test('Privacy Enforcement - Prevents user from viewing or modifying another user private record', async () => {
    // User 1 creates private record
    const createRes = await request(app)
      .post('/api/records/my')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        title: 'Top Secret User 1 Plan',
        description: 'Confidential thoughts',
        category: 'Security',
      });

    const recordId = createRes.body.data.record._id;

    // User 2 attempts to read User 1's record
    const getRes = await request(app)
      .get(`/api/records/my/${recordId}`)
      .set('Authorization', `Bearer ${user2Token}`);

    expect(getRes.status).toBe(403);
    expect(getRes.body.success).toBe(false);

    // User 2 attempts to update User 1's record
    const patchRes = await request(app)
      .patch(`/api/records/my/${recordId}`)
      .set('Authorization', `Bearer ${user2Token}`)
      .send({ title: 'Hacked by User 2' });

    expect(patchRes.status).toBe(403);

    // User 2 attempts to delete User 1's record
    const delRes = await request(app)
      .delete(`/api/records/my/${recordId}`)
      .set('Authorization', `Bearer ${user2Token}`);

    expect(delRes.status).toBe(403);
  });

  test('Record Visibility Rules - Users only see eligible published records', async () => {
    // 1. Published record for all active users
    await Record.create({
      title: 'Company Wide Announcement',
      description: 'Open to everyone in the company',
      category: 'General',
      status: 'Published',
      priority: 'Low',
      visibility: 'All active users',
      createdBy: adminUser._id,
    });

    // 2. Published record assigned specifically to User 1
    await Record.create({
      title: 'Task Assigned To User 1',
      description: 'Exclusive assignment for User 1',
      category: 'Operations',
      status: 'Published',
      priority: 'Medium',
      visibility: 'Assigned users only',
      assignedTo: [user1._id],
      createdBy: adminUser._id,
    });

    // 3. Draft record created by Admin
    await Record.create({
      title: 'Admin Unreleased Draft',
      description: 'Not published yet',
      category: 'Operations',
      status: 'Draft',
      visibility: 'All active users',
      createdBy: adminUser._id,
    });

    // 4. Published record assigned to User 2 only
    await Record.create({
      title: 'Task Assigned To User 2 Only',
      description: 'Exclusive assignment for User 2',
      category: 'Finance',
      status: 'Published',
      visibility: 'Assigned users only',
      assignedTo: [user2._id],
      createdBy: adminUser._id,
    });

    // User 1 requests available records
    const u1Available = await request(app)
      .get('/api/records/available')
      .set('Authorization', `Bearer ${user1Token}`);

    expect(u1Available.status).toBe(200);
    // User 1 should see Announcement AND Task Assigned To User 1 (2 records)
    // Should NOT see Admin Draft or Task Assigned To User 2 Only
    expect(u1Available.body.data.length).toBe(2);
    const titles = u1Available.body.data.map((r) => r.title);
    expect(titles).toContain('Company Wide Announcement');
    expect(titles).toContain('Task Assigned To User 1');
    expect(titles).not.toContain('Admin Unreleased Draft');
    expect(titles).not.toContain('Task Assigned To User 2 Only');
  });
});
