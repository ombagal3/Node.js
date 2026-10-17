const express = require('express');
const router = express.Router();
const {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/categoryController');
const { protect, authorizeAdmin } = require('../middleware/auth');
const { categoryValidation } = require('../middleware/validator');

router
  .route('/')
  .get(getCategories)
  .post(protect, authorizeAdmin, categoryValidation.create, createCategory);

router
  .route('/:id')
  .get(getCategoryById)
  .put(protect, authorizeAdmin, categoryValidation.update, updateCategory)
  .delete(protect, authorizeAdmin, deleteCategory);

module.exports = router;
