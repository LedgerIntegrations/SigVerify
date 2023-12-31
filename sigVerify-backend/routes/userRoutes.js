// /sigVerify-backend/routes/userRoutes
import express from 'express';
import * as userController from '../controllers/userControllers.js';
import authenticateToken from '../middleware/authenticateToken.js';

const router = express.Router();

router.post('/api/user/register', userController.createInitalUserTablesAndEmailAuthToken);
router.post('/api/user/create', userController.createNewUser);
router.post('/api/user/login', userController.authenticateLogin);

// Protected routes
router.get('/api/user/profileData', authenticateToken, userController.getProfilePageData);
router.put(
    '/api/user/updateWalletAddress',
    authenticateToken,
    userController.updateDatabaseWithNewVerifiedXrplWalletAddress
);

export default router;
