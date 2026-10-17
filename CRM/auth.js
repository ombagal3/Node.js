// auth.js — Bulletproof CRM Enterprise Authentication Module
// Implements: Password authentication, bcrypt hashing, JWT HTTP-only cookies,
// OTP generation/verification with rate limiting, and password reset flows.

require('dotenv').config();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// ============================================================
// CONFIGURATION (from environment variables)
// ============================================================
const JWT_SECRET = process.env.JWT_SECRET || 'bulletproof_default_jwt_secret_change_in_prod';
const JWT_EXPIRES_IN = '24h';
const RECOVERY_TOKEN_EXPIRES_IN = '15m';
const BCRYPT_ROUNDS = 12;
const OTP_EXPIRY_MINUTES = 10;
const OTP_MAX_ATTEMPTS = 5;
const OTP_RESEND_COOLDOWN_SECONDS = 60;
const LOGIN_MAX_ATTEMPTS = 10;
const LOGIN_LOCKOUT_MINUTES = 15;

// In-memory fallbacks when MongoDB is unavailable or during cold boot
const loginAttempts = new Map(); // ip -> { count, lockedUntil }
const otpRequestTracker = new Map(); // method -> { lastRequest, count }
let inMemoryUser = null;
let inMemoryPasswordResets = [];

// ============================================================
// RATE LIMITING HELPERS
// ============================================================
function getClientIp(req) {
  return req.headers['x-forwarded-for']?.split(',')[0].trim() ||
    req.socket?.remoteAddress ||
    '127.0.0.1';
}

function getLoginAttempts(ip) {
  const record = loginAttempts.get(ip);
  if (!record) return { count: 0, lockedUntil: null };
  if (record.lockedUntil && Date.now() > record.lockedUntil) {
    loginAttempts.delete(ip);
    return { count: 0, lockedUntil: null };
  }
  return record;
}

function recordLoginFailure(ip) {
  const record = getLoginAttempts(ip);
  record.count = (record.count || 0) + 1;
  if (record.count >= LOGIN_MAX_ATTEMPTS) {
    record.lockedUntil = Date.now() + LOGIN_LOCKOUT_MINUTES * 60 * 1000;
  }
  loginAttempts.set(ip, record);
}

function clearLoginAttempts(ip) {
  loginAttempts.delete(ip);
}

function isLoginLocked(ip) {
  const record = getLoginAttempts(ip);
  return record.lockedUntil && Date.now() < record.lockedUntil;
}

function getLockRemainingMinutes(ip) {
  const record = getLoginAttempts(ip);
  if (!record.lockedUntil) return 0;
  return Math.ceil((record.lockedUntil - Date.now()) / (60 * 1000));
}

function canResendOTP(identifier = 'email') {
  const record = otpRequestTracker.get(identifier);
  if (!record) return { allowed: true, waitSeconds: 0 };
  const elapsed = (Date.now() - record.lastRequest) / 1000;
  if (elapsed < OTP_RESEND_COOLDOWN_SECONDS) {
    return { allowed: false, waitSeconds: Math.ceil(OTP_RESEND_COOLDOWN_SECONDS - elapsed) };
  }
  return { allowed: true, waitSeconds: 0 };
}

function recordOTPRequest(identifier = 'email') {
  otpRequestTracker.set(identifier, {
    lastRequest: Date.now(),
    count: (otpRequestTracker.get(identifier)?.count || 0) + 1
  });
}

// ============================================================
// PASSWORD COMPLEXITY VALIDATOR
// ============================================================
function validatePasswordStrength(password) {
  if (!password || typeof password !== 'string') {
    return { valid: false, message: 'Password is required' };
  }
  const minLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(password);

  const errors = [];
  if (!minLength) errors.push('At least 8 characters');
  if (!hasUpper) errors.push('At least one uppercase letter (A-Z)');
  if (!hasLower) errors.push('At least one lowercase letter (a-z)');
  if (!hasNumber) errors.push('At least one number (0-9)');
  if (!hasSpecial) errors.push('At least one special character (!@#$%^&* etc.)');

  return {
    valid: errors.length === 0,
    errors,
    criteria: { minLength, hasUpper, hasLower, hasNumber, hasSpecial }
  };
}

// ============================================================
// PASSWORD HASHING
// ============================================================
async function hashPassword(plaintext) {
  const salt = await bcrypt.genSalt(BCRYPT_ROUNDS);
  return bcrypt.hash(plaintext, salt);
}

async function verifyPassword(plaintext, hash) {
  if (!plaintext || !hash) return false;
  return bcrypt.compare(plaintext, hash);
}

// ============================================================
// TOKEN MANAGEMENT (JWT)
// ============================================================
function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

function generateRecoveryToken(payload) {
  return jwt.sign({ ...payload, type: 'recovery_access' }, JWT_SECRET, { expiresIn: RECOVERY_TOKEN_EXPIRES_IN });
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

// ============================================================
// OTP GENERATION & VERIFICATION
// ============================================================
function generateOTP() {
  return crypto.randomInt(100000, 999999).toString();
}

async function hashOTP(otp) {
  return bcrypt.hash(otp, 8);
}

async function verifyOTP(otp, hash) {
  if (!otp || !hash) return false;
  return bcrypt.compare(otp, hash);
}

// ============================================================
// MASKING UTILITIES
// ============================================================
function maskEmail(email) {
  if (!email || !email.includes('@')) return '******';
  const [user, domain] = email.split('@');
  if (user.length <= 2) return `${user[0]}*@${domain}`;
  return `${user[0]}${'*'.repeat(Math.max(3, user.length - 2))}${user[user.length - 1]}@${domain}`;
}

// ============================================================
// COOKIE HELPERS
// ============================================================
function setAuthCookie(res, token) {
  res.cookie('crm_auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    path: '/'
  });
}

function clearAuthCookie(res) {
  res.clearCookie('crm_auth_token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/'
  });
}

// ============================================================
// DATABASE / RECOVERY STORAGE
// ============================================================
async function ensureAuthUser(db) {
  require('dotenv').config({ override: true });
  const initialPassword = process.env.CRM_INITIAL_PASSWORD || '##d0ntbRck$137';

  // If MongoDB is available, use 'users' collection
  if (db) {
    try {
      const collection = db.collection('users');
      let admin = await collection.findOne({ role: 'admin' });
      if (!admin) {
        const passwordHash = await hashPassword(initialPassword);
        admin = {
          id: 'admin-1',
          role: 'admin',
          passwordHash,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          passwordUpdatedAt: new Date()
        };
        await collection.insertOne(admin);
        console.log('✅ AUTH: Admin user initialized in MongoDB `users` collection.');
      }
      if (admin) {
        inMemoryUser = admin;
        return admin;
      }
    } catch (e) {
      console.warn('⚠️  AUTH DB Warning, falling back to in-memory user cache:', e.message);
    }
  }

  // In-memory fallback
  if (!inMemoryUser) {
    const passwordHash = await hashPassword(initialPassword);
    inMemoryUser = {
      id: 'admin-1',
      role: 'admin',
      passwordHash,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      passwordUpdatedAt: new Date()
    };
    console.log('✅ AUTH: Admin user initialized in memory.');
  }

  return inMemoryUser;
}

async function getAuthUser(db) {
  if (db) {
    try {
      const user = await db.collection('users').findOne({ role: 'admin', isActive: true });
      if (user) {
        inMemoryUser = user;
        return user;
      }
    } catch (e) {
      // fallback to memory
    }
  }
  if (!inMemoryUser) {
    return await ensureAuthUser(db);
  }
  return inMemoryUser;
}

async function updatePasswordHash(db, newHash) {
  const now = new Date();
  if (inMemoryUser) {
    inMemoryUser.passwordHash = newHash;
    inMemoryUser.updatedAt = now;
    inMemoryUser.passwordUpdatedAt = now;
  }

  if (db) {
    try {
      await db.collection('users').updateOne(
        { role: 'admin' },
        {
          $set: {
            passwordHash: newHash,
            updatedAt: now,
            passwordUpdatedAt: now
          }
        },
        { upsert: true }
      );
    } catch (e) {
      console.warn('⚠️  Could not update password in MongoDB:', e.message);
    }
  }
}

async function createPasswordReset(db, otpHash) {
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
  const resetEmail = process.env.RESET_EMAIL || 'bulletproofbrandscrm@gmail.com';
  const resetDoc = {
    id: crypto.randomUUID ? crypto.randomUUID() : 'reset_' + Date.now(),
    userId: 'admin-1',
    channel: 'email',
    email: resetEmail,
    otpHash,
    expiresAt,
    attempts: 0,
    maxAttempts: OTP_MAX_ATTEMPTS,
    verifiedAt: null,
    invalidated: false,
    createdAt: new Date()
  };

  // Keep in-memory
  inMemoryPasswordResets = inMemoryPasswordResets.map(r =>
    r.verifiedAt === null ? { ...r, invalidated: true } : r
  );
  inMemoryPasswordResets.push(resetDoc);

  if (db) {
    try {
      const coll = db.collection('passwordResets');
      await coll.updateMany({ verifiedAt: null }, { $set: { invalidated: true } });
      await coll.insertOne(resetDoc);
    } catch (e) {
      console.warn('⚠️  Could not insert reset into MongoDB passwordResets:', e.message);
    }
  }

  return resetDoc;
}

async function getLatestPasswordReset(db) {
  if (db) {
    try {
      const reset = await db.collection('passwordResets').findOne(
        { verifiedAt: null, invalidated: { $ne: true } },
        { sort: { createdAt: -1 } }
      );
      if (reset) return reset;
    } catch (e) { }
  }

  // fallback to in-memory
  const active = inMemoryPasswordResets
    .filter(r => !r.verifiedAt && !r.invalidated)
    .sort((a, b) => b.createdAt - a.createdAt);
  return active[0] || null;
}

async function incrementResetAttempts(db, resetId) {
  const item = inMemoryPasswordResets.find(r => r.id === resetId || String(r._id) === String(resetId));
  if (item) {
    item.attempts = (item.attempts || 0) + 1;
    if (item.attempts >= OTP_MAX_ATTEMPTS) {
      item.invalidated = true;
    }
  }

  if (db) {
    try {
      const query = resetId.length === 24 ? { _id: require('mongodb').ObjectId.createFromHexString(resetId) } : { id: resetId };
      const doc = await db.collection('passwordResets').findOneAndUpdate(
        query,
        { $inc: { attempts: 1 } },
        { returnDocument: 'after' }
      );
      if (doc && doc.attempts >= OTP_MAX_ATTEMPTS) {
        await db.collection('passwordResets').updateOne(query, { $set: { invalidated: true } });
      }
    } catch (e) { }
  }
}

async function markResetVerified(db, resetId) {
  const item = inMemoryPasswordResets.find(r => r.id === resetId || String(r._id) === String(resetId));
  if (item) {
    item.verifiedAt = new Date();
  }

  if (db) {
    try {
      const query = resetId.length === 24 ? { _id: require('mongodb').ObjectId.createFromHexString(resetId) } : { id: resetId };
      await db.collection('passwordResets').updateOne(query, { $set: { verifiedAt: new Date() } });
    } catch (e) { }
  }
}

// ============================================================
// REAL EMAIL SENDER (No Simulated / Fake Delivery)
// ============================================================
async function sendEmailOTP(email, otp) {
  try {
    require('dotenv').config({ override: true });
  } catch (_) { }

  const nodemailer = require('nodemailer');
  const smtpHost = process.env.SMTP_HOST?.trim();
  const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10);
  const smtpUser = process.env.SMTP_USER?.trim();
  const rawPass = process.env.SMTP_PASSWORD?.trim();
  // Strip whitespace from Google App Passwords (which are displayed in 4-character blocks)
  const smtpPass = rawPass ? rawPass.replace(/\s+/g, '') : '';

  if (!smtpUser || !smtpPass) {
    console.warn('⚠️  SMTP credentials missing in .env (SMTP_USER or SMTP_PASSWORD is not set).');
    return {
      sent: false,
      error: 'SMTP_CONFIG_MISSING',
      message: 'Unable to send OTP to email. Please try again.'
    };
  }

  try {
    const isGmail = (smtpHost && smtpHost.includes('gmail')) || (!smtpHost && smtpUser.includes('@gmail.com'));
    const transportConfig = isGmail
      ? {
        service: 'gmail',
        auth: {
          user: smtpUser,
          pass: smtpPass
        }
      }
      : {
        host: smtpHost || 'smtp.gmail.com',
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass
        },
        tls: {
          rejectUnauthorized: false
        }
      };

    const transporter = nodemailer.createTransport(transportConfig);

    const mailOptions = {
      from: `"Bulletproof CRM" <${smtpUser}>`,
      to: email,
      subject: 'Bulletproof CRM Password Reset OTP',
      text: `Your Bulletproof CRM password reset OTP is:\n\n${otp}\n\nThis OTP will expire in 10 minutes.\n\nIf you did not request a password reset, please ignore this email.`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; background: #0b0f19; color: #f8fafc; border-radius: 16px; border: 1px solid rgba(212, 175, 55, 0.3);">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #ffffff; font-size: 22px; font-weight: 800; letter-spacing: 2px; margin: 0; text-transform: uppercase;">
              BULLETPROOF <span style="color: #D4AF37;">CRM</span>
            </h1>
            <p style="color: #94a3b8; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; margin-top: 4px;">Impossible to Ignore</p>
          </div>
          <div style="background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; padding: 24px; margin-bottom: 20px;">
            <p style="font-size: 14px; color: #cbd5e1; margin-top: 0; margin-bottom: 16px;">Your Bulletproof CRM password reset OTP is:</p>
            <div style="background: #07090e; border: 2px solid #D4AF37; border-radius: 12px; padding: 18px; text-align: center; margin-bottom: 16px;">
              <span style="font-size: 34px; font-weight: 800; letter-spacing: 10px; color: #D4AF37; font-family: monospace;">${otp}</span>
            </div>
            <p style="font-size: 13px; color: #94a3b8; margin: 0; line-height: 1.5;">This OTP will expire in 10 minutes.<br>If you did not request a password reset, please ignore this email.</p>
          </div>
          <p style="font-size: 11px; color: #475569; text-align: center; margin: 0;">Bulletproof Brands Enterprise CRM &bull; Automated Security Service</p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email OTP dispatched to ${email} (Message ID: ${info.messageId})`);
    return { sent: true, messageId: info.messageId };
  } catch (err) {
    console.error('❌ Email OTP dispatch failed:', err.message);
    return {
      sent: false,
      error: err.message,
      message: 'Unable to send OTP to email. Please try again.'
    };
  }
}

// ============================================================
// AUTH MIDDLEWARE
// ============================================================
function authMiddleware(req, res, next) {
  const token = req.cookies?.crm_auth_token ||
    (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')
      ? req.headers.authorization.slice(7) : null);

  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  const decoded = verifyToken(token);
  if (!decoded || decoded.type === 'recovery_access') {
    return res.status(401).json({ success: false, message: 'Invalid or expired session' });
  }

  req.user = decoded;
  next();
}

function checkIsAuthenticated(req) {
  const token = req.cookies?.crm_auth_token ||
    (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')
      ? req.headers.authorization.slice(7) : null);
  if (!token) return false;
  const decoded = verifyToken(token);
  return Boolean(decoded && decoded.type !== 'recovery_access');
}

module.exports = {
  hashPassword,
  verifyPassword,
  generateToken,
  generateRecoveryToken,
  verifyToken,
  generateOTP,
  hashOTP,
  verifyOTP,
  validatePasswordStrength,
  maskEmail,
  authMiddleware,
  checkIsAuthenticated,
  setAuthCookie,
  clearAuthCookie,
  ensureAuthUser,
  getAuthUser,
  updatePasswordHash,
  createPasswordReset,
  getLatestPasswordReset,
  incrementResetAttempts,
  markResetVerified,
  sendEmailOTP,
  getClientIp,
  isLoginLocked,
  getLockRemainingMinutes,
  recordLoginFailure,
  clearLoginAttempts,
  canResendOTP,
  recordOTPRequest,
  OTP_EXPIRY_MINUTES
};
