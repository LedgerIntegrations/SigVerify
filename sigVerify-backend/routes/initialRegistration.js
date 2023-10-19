const express = require('express');
const router = express.Router();
const initialRegistrationController = require('../controllers/initialRegistrationControllers');

//web2 user sign in routes below
router.post('/api/user/register', initialRegistrationController.createEmailAuthVerificationToken);
router.get('/api/user/verifyEmailAuthToken', initialRegistrationController.verifyEmailAuthVerificationToken);



module.exports = router;