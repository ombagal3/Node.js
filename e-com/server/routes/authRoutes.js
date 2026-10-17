const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  logout
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { authValidation } = require('../middleware/validator');

router.post('/register', authValidation.register, register);
router.post('/login', authValidation.login, login);
router.get('/me', protect, getMe);
router.post('/logout', logout);

module.exports = router;
