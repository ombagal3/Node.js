const { validationResult, body, query, param } = require('express-validator');

/**
 * Middleware to check validation results and respond with formatted errors
 */
function validateRequest(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.path,
      message: err.msg
    }));

    return res.status(400).json({
      success: false,
      message: formattedErrors[0].message,
      errors: formattedErrors
    });
  }
  next();
}

// User Auth Validation Rules
const authValidation = {
  register: [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Name is required')
      .isLength({ max: 50 })
      .withMessage('Name cannot exceed 50 characters'),
    body('email')
      .trim()
      .isEmail()
      .withMessage('A valid email address is required')
      .normalizeEmail(),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long'),
    validateRequest
  ],
  login: [
    body('email')
      .trim()
      .isEmail()
      .withMessage('Please provide a valid email')
      .normalizeEmail(),
    body('password')
      .notEmpty()
      .withMessage('Password is required'),
    validateRequest
  ]
};

// Category Validation Rules
const categoryValidation = {
  create: [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Category name is required')
      .isLength({ max: 60 })
      .withMessage('Category name cannot exceed 60 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Description cannot exceed 500 characters'),
    body('image')
      .optional()
      .trim(),
    body('status')
      .optional()
      .isIn(['active', 'inactive'])
      .withMessage('Status must be either active or inactive'),
    validateRequest
  ],
  update: [
    param('id')
      .isMongoId()
      .withMessage('Invalid category ID'),
    body('name')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Category name cannot be empty')
      .isLength({ max: 60 }),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 500 }),
    body('status')
      .optional()
      .isIn(['active', 'inactive']),
    validateRequest
  ]
};

// Product Validation Rules
const productValidation = {
  create: [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Product name is required')
      .isLength({ max: 160 })
      .withMessage('Product name cannot exceed 160 characters'),
    body('description')
      .trim()
      .notEmpty()
      .withMessage('Product description is required'),
    body('price')
      .isFloat({ min: 0 })
      .withMessage('Price must be a positive number or zero'),
    body('compareAtPrice')
      .optional({ nullable: true })
      .isFloat({ min: 0 })
      .withMessage('Compare at price must be a positive number'),
    body('SKU')
      .trim()
      .notEmpty()
      .withMessage('SKU is required'),
    body('category')
      .isMongoId()
      .withMessage('A valid category ID is required'),
    body('brand')
      .trim()
      .notEmpty()
      .withMessage('Brand is required'),
    body('images')
      .isArray({ min: 1 })
      .withMessage('At least one product image is required'),
    body('stock')
      .isInt({ min: 0 })
      .withMessage('Stock must be an integer of 0 or greater'),
    body('status')
      .optional()
      .isIn(['active', 'inactive', 'draft'])
      .withMessage('Status must be active, inactive, or draft'),
    body('isFeatured')
      .optional()
      .isBoolean()
      .withMessage('isFeatured must be boolean'),
    validateRequest
  ],
  update: [
    param('id')
      .isMongoId()
      .withMessage('Invalid product ID'),
    body('name')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Product name cannot be empty'),
    body('price')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Price must be positive or zero'),
    body('compareAtPrice')
      .optional({ nullable: true })
      .isFloat({ min: 0 }),
    body('SKU')
      .optional()
      .trim()
      .notEmpty(),
    body('category')
      .optional()
      .isMongoId()
      .withMessage('Category must be a valid ID'),
    body('stock')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Stock must be an integer of 0 or greater'),
    body('status')
      .optional()
      .isIn(['active', 'inactive', 'draft']),
    validateRequest
  ]
};

module.exports = {
  validateRequest,
  authValidation,
  categoryValidation,
  productValidation
};
