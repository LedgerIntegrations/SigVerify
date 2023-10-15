const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

//xumm and/or xrpl user functionality routes
router.get('/api/user/createXummSigninPayload', userController.createXummSigninPayload);
router.post('/api/user/findAllAccountPaymentTransactionsToSigVerifyWallet', userController.findAllAccountPaymentTransactionsToSigVerifyWallet);
router.post('/api/user/subscribeToPayload', userController.createXummPayloadSubscription);

//web2 user sign in routes below


module.exports = router;