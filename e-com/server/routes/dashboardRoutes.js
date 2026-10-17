const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/dashboardController');
const { protect, authorizeAdmin } = require('../middleware/auth');

router.get('/stats', protect, authorizeAdmin, getDashboardStats);

module.exports = router;
