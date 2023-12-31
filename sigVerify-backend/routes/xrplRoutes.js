import express from 'express';
import * as xrplController from '../controllers/xrplControllers.js'; // Ensure the path is correct and add '.js' extension

const router = express.Router();

//xumm and/or xrpl user functionality routes
router.get('/api/xrpl/createXummSigninPayload', xrplController.createXummSigninPayload);

router.post('/api/xrpl/subscribeToPayload', xrplController.createXummPayloadSubscription);

router.post(
    '/api/xrpl/findAllAccountPaymentTransactionsToSigVerifyWallet',
    xrplController.findAllXrplAccountPaymentTransactionsToSigVerifyWallet
);

router.post('/api/xrpl/signDocument');
export default router;
