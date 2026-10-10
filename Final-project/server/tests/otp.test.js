const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');
const PasswordReset = require('../src/models/PasswordReset');
const { hashOtp } = require('../src/services/otpService');
require('./setup');

describe('Email OTP & Password Reset Test Suite', () => {
  const user = {
    name: 'Eve Adams',
    email: 'eve@test.com',
    password: 'OldPassword123!',
    confirmPassword: 'OldPassword123!',
  };

  beforeEach(async () => {
    await request(app).post('/api/auth/register').send(user);
  });

  test('POST /api/auth/forgot-password - Responds generically to prevent email enumeration', async () => {
    const regRes = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'eve@test.com' });
    expect(regRes.status).toBe(200);
    expect(regRes.body.success).toBe(true);

    const nonRegRes = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'nonexistent@test.com' });
    expect(nonRegRes.status).toBe(200);
    expect(nonRegRes.body.success).toBe(true);
    expect(regRes.body.message).toEqual(nonRegRes.body.message);
  });

  test('POST /api/auth/verify-otp - Rejects incorrect OTP and counts attempts', async () => {
    const dbUser = await User.findOne({ email: 'eve@test.com' });
    const otpHash = await hashOtp('123456');

    await PasswordReset.create({
      userId: dbUser._id,
      otpHash,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      attempts: 0,
    });

    const res = await request(app).post('/api/auth/verify-otp').send({
      email: 'eve@test.com',
      otp: '999999',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/Invalid verification code/i);

    const updated = await PasswordReset.findOne({ userId: dbUser._id });
    expect(updated.attempts).toBe(1);
  });

  test('POST /api/auth/verify-otp - Rejects expired OTP', async () => {
    const dbUser = await User.findOne({ email: 'eve@test.com' });
    const otpHash = await hashOtp('123456');

    await PasswordReset.create({
      userId: dbUser._id,
      otpHash,
      expiresAt: new Date(Date.now() - 1000), // Expired 1 second ago
      attempts: 0,
    });

    const res = await request(app).post('/api/auth/verify-otp').send({
      email: 'eve@test.com',
      otp: '123456',
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/expired/i);
  });

  test('Complete flow: Verify valid OTP and Reset Password', async () => {
    const dbUser = await User.findOne({ email: 'eve@test.com' });
    const correctOtp = '654321';
    const otpHash = await hashOtp(correctOtp);

    await PasswordReset.create({
      userId: dbUser._id,
      otpHash,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      attempts: 0,
    });

    // 1. Verify OTP
    const verifyRes = await request(app).post('/api/auth/verify-otp').send({
      email: 'eve@test.com',
      otp: correctOtp,
    });

    expect(verifyRes.status).toBe(200);
    expect(verifyRes.body.success).toBe(true);
    expect(verifyRes.body.data.resetToken).toBeDefined();

    const resetToken = verifyRes.body.data.resetToken;

    // 2. Reset Password
    const resetRes = await request(app).post('/api/auth/reset-password').send({
      email: 'eve@test.com',
      resetToken,
      newPassword: 'BrandNewPassword123!',
      confirmPassword: 'BrandNewPassword123!',
    });

    expect(resetRes.status).toBe(200);
    expect(resetRes.body.success).toBe(true);

    // 3. Login with old password fails
    const oldLogin = await request(app).post('/api/auth/login').send({
      email: 'eve@test.com',
      password: 'OldPassword123!',
    });
    expect(oldLogin.status).toBe(401);

    // 4. Login with new password succeeds
    const newLogin = await request(app).post('/api/auth/login').send({
      email: 'eve@test.com',
      password: 'BrandNewPassword123!',
    });
    expect(newLogin.status).toBe(200);
    expect(newLogin.body.data.accessToken).toBeDefined();
  });
});
