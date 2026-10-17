const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Generate JWT and set HTTP-only cookie
 */
function sendTokenResponse(user, statusCode, res) {
  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET || 'super_secret_jwt_development_key_9384729183748291',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  const isProduction = process.env.NODE_ENV === 'production';
  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax'
  };

  res
    .status(statusCode)
    .cookie('token', token, cookieOptions)
    .json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      }
    });
}

/**
 * @desc    Register a new user (customer role)
 * @route   POST /api/auth/register
 * @access  Public
 */
async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.'
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: 'customer' // Public registrations are always customers
    });

    sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    // Explicitly select password since it has select: false in schema
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Get currently authenticated user
 * @route   GET /api/auth/me
 * @access  Private
 */
async function getMe(req, res) {
  res.status(200).json({
    success: true,
    user: req.user
  });
}

/**
 * @desc    Log out current user / clear cookie
 * @route   POST /api/auth/logout
 * @access  Public / Private
 */
async function logout(req, res) {
  const isProduction = process.env.NODE_ENV === 'production';
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 5 * 1000),
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax'
  });

  res.status(200).json({
    success: true,
    message: 'User logged out successfully.'
  });
}

module.exports = {
  register,
  login,
  getMe,
  logout
};
