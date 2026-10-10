const express = require('express');
const router = express.Router();

const dashboardController = require('../controllers/dashboardController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

// Admin dashboard stats
router.get('/admin/stats', authenticate, authorize('admin'), dashboardController.getAdminStats);

// User dashboard stats
router.get('/user/stats', authenticate, dashboardController.getUserStats);

module.exports = router;
