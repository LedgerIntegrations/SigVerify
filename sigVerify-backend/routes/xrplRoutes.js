import express from 'express';
import * as xrplController from '../controllers/xrplControllers.js'; // Ensure the path is correct and add '.js' extension
import authenticateToken from '../middleware/authenticateToken.js';

const router = express.Router();

// public routes
router.get('/api/xrpl/account/transactions/payments/received/:wallet', xrplController.getReceivedPaymentTransactions);
router.get('/api/xrpl/payload/create/signin', xrplController.createXamanSigninPayload);

router.post('/api/xrpl/payload/create/transaction/signature', xrplController.generateXamanPayloadForPaymentTxWithMemo);
router.post('/api/xrpl/payload/subscribe', xrplController.createXamanPayloadSubscription);


// protected routes

export default router;
