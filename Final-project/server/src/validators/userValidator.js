const { body } = require('express-validator');

const adminCreateUserValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Full name is required')
    .isLength({ min: 2, max: 80 })
    .withMessage('Full name must be between 2 and 80 characters'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email address is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/)
    .withMessage('Password must contain at least one lowercase letter')
    .matches(/[0-9]/)
    .withMessage('Password must contain at least one number'),
  body('role')
    .optional()
    .isIn(['admin', 'user'])
    .withMessage('Role must be either admin or user'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean value'),
];

const adminUpdateUserValidator = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 80 })
    .withMessage('Full name must be between 2 and 80 characters'),
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('role')
    .optional()
    .isIn(['admin', 'user'])
    .withMessage('Role must be either admin or user'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean value'),
  body('password')
    .optional({ checkFalsy: true })
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/)
    .withMessage('Password must contain at least one lowercase letter')
    .matches(/[0-9]/)
    .withMessage('Password must contain at least one number'),
];

const updateProfileValidator = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 80 })
    .withMessage('Full name must be between 2 and 80 characters'),
  body('currentPassword')
    .optional()
    .notEmpty()
    .withMessage('Current password is required to change password'),
  body('newPassword')
    .optional()
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters long')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/)
    .withMessage('Password must contain at least one lowercase letter')
    .matches(/[0-9]/)
    .withMessage('Password must contain at least one number'),
];

module.exports = {
  adminCreateUserValidator,
  adminUpdateUserValidator,
  updateProfileValidator,
};
