const express = require('express');
const router = express.Router();

const recordController = require('../controllers/recordController');
const authenticate = require('../middleware/authenticate');
const validate = require('../middleware/validate');
const { createRecordValidator, updateRecordValidator } = require('../validators/recordValidator');

// All endpoints require authentication
router.use(authenticate);

// View admin published records available to user
router.get('/available', recordController.userGetAvailableRecords);

// User personal records CRUD
router.get('/my', recordController.userGetMyRecords);
router.post('/my', validate(createRecordValidator), recordController.userCreateMyRecord);
router.get('/my/:id', recordController.userGetMyRecordById);
router.patch('/my/:id', validate(updateRecordValidator), recordController.userUpdateMyRecord);
router.delete('/my/:id', recordController.userDeleteMyRecord);

module.exports = router;
