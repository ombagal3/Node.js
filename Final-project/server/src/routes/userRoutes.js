const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');
const authenticate = require('../middleware/authenticate');
const validate = require('../middleware/validate');
const { updateProfileValidator } = require('../validators/userValidator');

router.use(authenticate);

router.get('/me', userController.getProfile);
router.patch('/me', validate(updateProfileValidator), userController.updateProfile);

module.exports = router;
