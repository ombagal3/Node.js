const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');
const { protect, authorizeAdmin } = require('../middleware/auth');
const { productValidation } = require('../middleware/validator');

router
  .route('/')
  .get(getProducts)
  .post(protect, authorizeAdmin, productValidation.create, createProduct);

router
  .route('/:id')
  .get(getProductById)
  .put(protect, authorizeAdmin, productValidation.update, updateProduct)
  .delete(protect, authorizeAdmin, deleteProduct);

module.exports = router;
