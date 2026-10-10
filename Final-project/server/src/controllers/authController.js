const bcrypt = require('bcryptjs');
const User = require('../models/User');
const PasswordReset = require('../models/PasswordReset');
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  hashToken,
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
} = require('../services/tokenService');
const {
  OTP_EXPIRY_MINUTES,
  MAX_VERIFICATION_ATTEMPTS,
  RESEND_COOLDOWN_SECONDS,
  generateOtp,
  hashOtp,
  verifyOtpHash,
  generateResetToken,
  hashResetToken,
} = require('../services/otpService');
const { sendPasswordResetOtpEmail } = require('../services/emailService');

/**
 * Register a new user account (Always 'user' role)
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    // Strictly enforce 'user' role for self-registration
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      role: 'user',
      isActive: true,
    });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshTokenHash = hashToken(refreshToken);
    await user.save();

    setRefreshTokenCookie(res, refreshToken);

    return res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      data: {
        user,
        accessToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login user
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail }).select('+passwordHash +refreshTokenHash');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact an administrator.',
      });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshTokenHash = hashToken(refreshToken);
    await user.save();

    setRefreshTokenCookie(res, refreshToken);

    return res.status(200).json({
      success: true,
      message: 'Logged in successfully.',
      data: {
        user,
        accessToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Logout user
 */
const logout = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;
    if (token) {
      const hashed = hashToken(token);
      await User.updateOne({ refreshTokenHash: hashed }, { $set: { refreshTokenHash: null } });
    } else if (req.user) {
      await User.findByIdAndUpdate(req.user._id, { refreshTokenHash: null });
    }

    clearRefreshTokenCookie(res);

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current authenticated user
 */
const getMe = async (req, res, next) => {
  try {
    return res.status(200).json({
      success: true,
      data: {
        user: req.user,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Renew access token using refresh token
 */
const refresh = async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token is required.',
      });
    }

    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded || !decoded.id) {
      clearRefreshTokenCookie(res);
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token. Please log in again.',
      });
    }

    const hashed = hashToken(refreshToken);
    const user = await User.findById(decoded.id).select('+refreshTokenHash');

    if (!user || user.refreshTokenHash !== hashed) {
      clearRefreshTokenCookie(res);
      return res.status(401).json({
        success: false,
        message: 'Invalid session or revoked refresh token.',
      });
    }

    if (!user.isActive) {
      clearRefreshTokenCookie(res);
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated.',
      });
    }

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    user.refreshTokenHash = hashToken(newRefreshToken);
    await user.save();

    setRefreshTokenCookie(res, newRefreshToken);

    return res.status(200).json({
      success: true,
      data: {
        accessToken: newAccessToken,
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Request Password Reset OTP
 */
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail });

    // Anti-enumeration: always respond identically whether user exists or not
    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'If that email is registered in our system, a 6-digit verification code has been sent.',
      });
    }

    // Check for active cooldown
    const existingReset = await PasswordReset.findOne({ userId: user._id });
    if (existingReset && existingReset.lastSentAt) {
      const secondsSinceLastSent = (Date.now() - new Date(existingReset.lastSentAt).getTime()) / 1000;
      if (secondsSinceLastSent < RESEND_COOLDOWN_SECONDS) {
        const waitTime = Math.ceil(RESEND_COOLDOWN_SECONDS - secondsSinceLastSent);
        return res.status(429).json({
          success: false,
          message: `Please wait ${waitTime} seconds before requesting a new verification code.`,
        });
      }
    }

    const otp = generateOtp();
    const otpHash = await hashOtp(otp);
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    // Upsert password reset entry
    await PasswordReset.findOneAndUpdate(
      { userId: user._id },
      {
        userId: user._id,
        otpHash,
        resetTokenHash: null,
        expiresAt,
        attempts: 0,
        lastSentAt: new Date(),
        verifiedAt: null,
      },
      { upsert: true, new: true }
    );

    await sendPasswordResetOtpEmail(user.email, user.name, otp);

    return res.status(200).json({
      success: true,
      message: 'If that email is registered in our system, a 6-digit verification code has been sent.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Verify OTP
 */
const verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification code.',
      });
    }

    const resetRecord = await PasswordReset.findOne({ userId: user._id });
    if (!resetRecord) {
      return res.status(400).json({
        success: false,
        message: 'No active password reset request found. Please request a new code.',
      });
    }

    if (new Date() > new Date(resetRecord.expiresAt)) {
      await PasswordReset.deleteOne({ _id: resetRecord._id });
      return res.status(400).json({
        success: false,
        message: 'The verification code has expired. Please request a new code.',
      });
    }

    if (resetRecord.attempts >= MAX_VERIFICATION_ATTEMPTS) {
      await PasswordReset.deleteOne({ _id: resetRecord._id });
      return res.status(429).json({
        success: false,
        message: 'Maximum verification attempts exceeded. Please request a new code.',
      });
    }

    const isMatch = await verifyOtpHash(otp, resetRecord.otpHash);
    if (!isMatch) {
      resetRecord.attempts += 1;
      await resetRecord.save();
      const remainingAttempts = MAX_VERIFICATION_ATTEMPTS - resetRecord.attempts;
      return res.status(400).json({
        success: false,
        message: `Invalid verification code. ${remainingAttempts} attempts remaining.`,
      });
    }

    // OTP matched: Generate authorization token for final password reset
    const resetToken = generateResetToken();
    resetRecord.resetTokenHash = hashResetToken(resetToken);
    resetRecord.verifiedAt = new Date();
    // Give 10 minutes to complete the new password submission
    resetRecord.expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await resetRecord.save();

    return res.status(200).json({
      success: true,
      message: 'Verification code confirmed successfully.',
      data: {
        resetToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reset password using validated resetToken
 */
const resetPassword = async (req, res, next) => {
  try {
    const { email, resetToken, newPassword } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request. Please restart the password reset process.',
      });
    }

    const hashedToken = hashResetToken(resetToken);
    const resetRecord = await PasswordReset.findOne({
      userId: user._id,
      resetTokenHash: hashedToken,
    });

    if (!resetRecord || !resetRecord.verifiedAt) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or unverified reset session. Please request a new code.',
      });
    }

    if (new Date() > new Date(resetRecord.expiresAt)) {
      await PasswordReset.deleteOne({ _id: resetRecord._id });
      return res.status(400).json({
        success: false,
        message: 'Reset session expired. Please restart the password reset process.',
      });
    }

    const salt = await bcrypt.genSalt(12);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    // Invalidate all active refresh tokens/sessions for security
    user.refreshTokenHash = null;
    await user.save();

    // Delete used reset record
    await PasswordReset.deleteOne({ _id: resetRecord._id });
    clearRefreshTokenCookie(res);

    return res.status(200).json({
      success: true,
      message: 'Password reset successfully. You can now log in with your new credentials.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  logout,
  getMe,
  refresh,
  forgotPassword,
  verifyOtp,
  resetPassword,
};
