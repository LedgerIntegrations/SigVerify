// /sigVerify-backend/routes/userRoutes
import express from 'express';
import * as userController from '../controllers/userControllers.js';
import authenticateToken from '../middleware/authenticateToken.js';

const router = express.Router();

router.post('/api/user/register', userController.registerUser);
router.post('/api/user/create', userController.completeUserRegistration);
router.post('/api/user/login', userController.authenticateLogin);
router.get('/api/user/logout', userController.removeAuthTokenCookie);

// Protected routes
router.get('/api/user/email', authenticateToken, userController.getUserEmail);
router.post('/api/authenticateCookie', authenticateToken, userController.authenticateExistingCookie);
router.get('/api/user/profileData', authenticateToken, userController.getUserProfileData);
router.put('/api/user/wallet', authenticateToken, userController.addOrUpdateXrplWalletAddress);
router.get('/api/user/signatures', authenticateToken, userController.getUserSignatures);
router.post(
    '/api/user/publicKeyAndWallet',
    authenticateToken,
    userController.getUserPublicKeyAndXrplWalletByHashedEmail
);

router.delete('/api/user/wallet', authenticateToken, userController.deleteXrplWalletAddress)

export default router;
