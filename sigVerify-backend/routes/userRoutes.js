// /sigVerify-backend/routes/userRoutes
import express from 'express';
import * as userController from '../controllers/userControllers.js';
import authenticateToken from '../middleware/authenticateToken.js';

const router = express.Router();

router.post('/api/user/register', userController.createInitialUserTablesAndEmailAuthToken);
router.post('/api/user/create', userController.addInitialUserProfileData);
router.post('/api/user/login', userController.authenticateLogin);
router.get('/api/user/logout', userController.removeAuthTokenCookie);

// Protected routes
router.post('/api/authenticateCookie', authenticateToken, userController.authenticateExistingCookie);
router.get('/api/user/profileData', authenticateToken, userController.getProfilePageData);
router.put(
    '/api/user/updateWalletAddress',
    authenticateToken,
    userController.updateDatabaseWithNewVerifiedXrplWalletAddress
);

router.post(
    '/api/user/publicKeyAndWallet',
    authenticateToken,
    userController.getUserPublicKeyAndAuthenticatedWalletByHashedEmail
);

export default router;
