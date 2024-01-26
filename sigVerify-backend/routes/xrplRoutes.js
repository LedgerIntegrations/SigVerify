import express from 'express';
import * as xrplController from '../controllers/xrplControllers.js'; // Ensure the path is correct and add '.js' extension
import authenticateToken from '../middleware/authenticateToken.js';

const router = express.Router();

// protected routes
router.get('/api/xrpl/createXamanSigninPayload', authenticateToken, xrplController.createXamanSigninPayload);
router.post('/api/xrpl/subscribeToPayload', authenticateToken, xrplController.createXamanPayloadSubscription);
router.post(
    '/api/xrpl/findAllAccountPaymentTransactionsToSigVerifyWallet',
    authenticateToken,
    xrplController.findAllXrplAccountPaymentTransactionsToSigVerifyWallet
);

router.post(
    '/api/xrpl/create/memoPaymentTxPayload',
    authenticateToken,
    xrplController.generateXamanPayloadForPaymentTxWithMemo
);
export default router;
