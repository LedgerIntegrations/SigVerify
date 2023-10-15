const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/api/user/createXummSigninPayload', userController.createXummSigninPayload);
router.post('/api/user/findAllAccountPaymentTransactionsToSigVerifyWallet', userController.findAllAccountPaymentTransactionsToSigVerifyWallet);
router.post('/api/user/subscribeToPayload', userController.createXummPayloadSubscription);

module.exports = router;