const express = require('express');
const router = express.Router();
const userController = require('../controllers/userControllers');

//web2 user sign in routes below
router.post('/api/user-create', userController.createNewUser);
router.post('/api/user-login', userController.checkLoginCredentials);


module.exports = router;