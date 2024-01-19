import express from 'express';
import * as xrplController from '../controllers/xrplControllers.js'; // Ensure the path is correct and add '.js' extension
import authenticateToken from '../middleware/authenticateToken.js';

const router = express.Router();

// protected routes
router.get('/api/xrpl/createXummSigninPayload', authenticateToken, xrplController.createXummSigninPayload);
router.post('/api/xrpl/subscribeToPayload', authenticateToken, xrplController.createXummPayloadSubscription);
router.post(
    '/api/xrpl/findAllAccountPaymentTransactionsToSigVerifyWallet',
    authenticateToken,
    xrplController.findAllXrplAccountPaymentTransactionsToSigVerifyWallet
);

router.post('/api/xrpl/signEncryptedJsonData', authenticateToken, xrplController.signEncryptedJsonData);
export default router;
