const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/api/createXummSigninPayload', userController.createXummSigninPayload);
router.post('/api/subscribeToPayload', userController.subscribeToPayload);

module.exports = router;