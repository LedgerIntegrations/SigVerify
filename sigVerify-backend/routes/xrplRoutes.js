const express = require('express');
const router = express.Router();
const xrplController = require('../controllers/xrplControllers');

//xumm and/or xrpl user functionality routes
router.get('/api/xrpl/user/createXummSigninPayload', xrplController.createXummSigninPayload);
router.post('/api/xrpl/user/findAllAccountPaymentTransactionsToSigVerifyWallet', xrplController.findAllXrplAccountPaymentTransactionsToSigVerifyWallet);
router.post('/api/xrpl/user/subscribeToPayload', xrplController.createXummPayloadSubscription);

module.exports = router;