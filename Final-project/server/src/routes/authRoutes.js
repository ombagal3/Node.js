const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();

const authController = require('../controllers/authController');
const authenticate = require('../middleware/authenticate');
const validate = require('../middleware/validate');
const {
  registerValidator,
  loginValidator,
  forgotPasswordValidator,
  verifyOtpValidator,
  resetPasswordValidator,
} = require('../validators/authValidator');

// Rate limiter for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again after 15 minutes.',
  },
});

// Stricter rate limiter for password reset and OTP requests
const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many OTP requests from this IP. Please try again after 15 minutes.',
  },
});

// Public Authentication Endpoints
router.post('/register', authLimiter, validate(registerValidator), authController.register);
router.post('/login', authLimiter, validate(loginValidator), authController.login);
router.post('/logout', authController.logout);
router.post('/refresh', authController.refresh);
router.post('/forgot-password', otpLimiter, validate(forgotPasswordValidator), authController.forgotPassword);
router.post('/verify-otp', otpLimiter, validate(verifyOtpValidator), authController.verifyOtp);
router.post('/reset-password', authLimiter, validate(resetPasswordValidator), authController.resetPassword);

// Protected Authentication Endpoints
router.get('/me', authenticate, authController.getMe);

module.exports = router;
