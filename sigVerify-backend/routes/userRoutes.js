// /sigVerify-backend/routes/userRoutes

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userControllers');
const authenticateToken = require('../middleware/authenticateToken');

router.post('/api/user/register', userController.createInitalUserTablesAndEmailAuthToken);
router.post('/api/user/create', userController.createNewUser);
router.post('/api/user/login', userController.authenticateLogin);

// protected routes
router.put('/api/user/updateWalletAddress', authenticateToken, userController.updateDatabaseWithNewVerifiedXrplWalletAddress);

module.exports = router;