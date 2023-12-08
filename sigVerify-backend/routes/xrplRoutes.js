const express = require('express');
const router = express.Router();
const xrplController = require('../controllers/xrplControllers');

//xumm and/or xrpl user functionality routes
router.get('/api/xrpl/createXummSigninPayload', xrplController.createXummSigninPayload);

router.post('/api/xrpl/subscribeToPayload', xrplController.createXummPayloadSubscription);

router.post(
    '/api/xrpl/findAllAccountPaymentTransactionsToSigVerifyWallet',
    xrplController.findAllXrplAccountPaymentTransactionsToSigVerifyWallet
);

router.post('/api/xrpl/signDocument');
module.exports = router;
