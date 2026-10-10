const express = require('express');
const router = express.Router();

const adminController = require('../controllers/adminController');
const recordController = require('../controllers/recordController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const validate = require('../middleware/validate');
const { adminCreateUserValidator, adminUpdateUserValidator } = require('../validators/userValidator');
const { createRecordValidator, updateRecordValidator } = require('../validators/recordValidator');

// Strict protection: Only authenticated users with 'admin' role
router.use(authenticate, authorize('admin'));

/* Admin User Management */
router.get('/users', adminController.getAllUsers);
router.post('/users', validate(adminCreateUserValidator), adminController.createUser);
router.get('/users/:id', adminController.getUserById);
router.patch('/users/:id', validate(adminUpdateUserValidator), adminController.updateUser);
router.patch('/users/:id/status', adminController.updateUserStatus);
router.delete('/users/:id', adminController.deleteUser);

/* Admin Record Management */
router.get('/records', recordController.adminGetAllRecords);
router.post('/records', validate(createRecordValidator), recordController.adminCreateRecord);
router.get('/records/:id', recordController.adminGetRecordById);
router.patch('/records/:id', validate(updateRecordValidator), recordController.adminUpdateRecord);
router.delete('/records/:id', recordController.adminDeleteRecord);

module.exports = router;
