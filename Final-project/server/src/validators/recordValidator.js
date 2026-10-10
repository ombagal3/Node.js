const { body, query } = require('express-validator');
const mongoose = require('mongoose');

const validCategories = ['Operations', 'Security', 'Compliance', 'Engineering', 'Finance', 'General'];
const validStatuses = ['Draft', 'Published', 'Archived'];
const validPriorities = ['Low', 'Medium', 'High'];
const validVisibilities = ['Assigned users only', 'All active users'];

const createRecordValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 3, max: 150 })
    .withMessage('Title must be between 3 and 150 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ min: 3, max: 3000 })
    .withMessage('Description must be between 3 and 3000 characters'),
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required')
    .isIn(validCategories)
    .withMessage(`Category must be one of: ${validCategories.join(', ')}`),
  body('status')
    .optional()
    .isIn(validStatuses)
    .withMessage(`Status must be one of: ${validStatuses.join(', ')}`),
  body('priority')
    .optional()
    .isIn(validPriorities)
    .withMessage(`Priority must be one of: ${validPriorities.join(', ')}`),
  body('visibility')
    .optional()
    .isIn(validVisibilities)
    .withMessage(`Visibility must be one of: ${validVisibilities.join(', ')}`),
  body('assignedTo')
    .optional()
    .isArray()
    .withMessage('assignedTo must be an array of user IDs')
    .custom((ids) => {
      if (Array.isArray(ids)) {
        for (const id of ids) {
          if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new Error(`Invalid user ID format in assignedTo: ${id}`);
          }
        }
      }
      return true;
    }),
];

const updateRecordValidator = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 150 })
    .withMessage('Title must be between 3 and 150 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 3, max: 3000 })
    .withMessage('Description must be between 3 and 3000 characters'),
  body('category')
    .optional()
    .trim()
    .isIn(validCategories)
    .withMessage(`Category must be one of: ${validCategories.join(', ')}`),
  body('status')
    .optional()
    .isIn(validStatuses)
    .withMessage(`Status must be one of: ${validStatuses.join(', ')}`),
  body('priority')
    .optional()
    .isIn(validPriorities)
    .withMessage(`Priority must be one of: ${validPriorities.join(', ')}`),
  body('visibility')
    .optional()
    .isIn(validVisibilities)
    .withMessage(`Visibility must be one of: ${validVisibilities.join(', ')}`),
  body('assignedTo')
    .optional()
    .isArray()
    .withMessage('assignedTo must be an array of user IDs')
    .custom((ids) => {
      if (Array.isArray(ids)) {
        for (const id of ids) {
          if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new Error(`Invalid user ID format in assignedTo: ${id}`);
          }
        }
      }
      return true;
    }),
];

module.exports = {
  createRecordValidator,
  updateRecordValidator,
};
