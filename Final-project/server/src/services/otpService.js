const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const OTP_EXPIRY_MINUTES = 5;
const MAX_VERIFICATION_ATTEMPTS = 5;
const RESEND_COOLDOWN_SECONDS = 60;

/**
 * Generate a cryptographically secure 6-digit OTP
 */
const generateOtp = () => {
  return crypto.randomInt(100000, 1000000).toString();
};

/**
 * Hash OTP using bcrypt
 */
const hashOtp = async (otp) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(otp, salt);
};

/**
 * Compare plain OTP with hashed OTP
 */
const verifyOtpHash = async (plainOtp, hashedOtp) => {
  return bcrypt.compare(plainOtp, hashedOtp);
};

/**
 * Generate a random reset token to authorize the password reset step
 */
const generateResetToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Hash a reset token
 */
const hashResetToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

module.exports = {
  OTP_EXPIRY_MINUTES,
  MAX_VERIFICATION_ATTEMPTS,
  RESEND_COOLDOWN_SECONDS,
  generateOtp,
  hashOtp,
  verifyOtpHash,
  generateResetToken,
  hashResetToken,
};
