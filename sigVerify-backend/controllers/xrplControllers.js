const {
    createXummSigninPayload,
    createXummPayloadSubscription,
    findAllAccountPaymentTransactionsToSigVerifyWallet,
    createPaymentTxWithDocHashInMemo,
} = require('../utils/xrplHelpers');

exports.createXummSigninPayload = async (req, res) => {
    try {
        const response = await createXummSigninPayload();
        res.json(response);
    } catch (error) {
        console.error('Error while create sign-in payload: ', error);
        res.status(500).json({
            error: 'Internal Server Error in createXummSigninPayload controller.',
        });
    }
};

//responds back to client with specificPropertiesFromPayloadSubscriptionResolution
exports.createXummPayloadSubscription = async (req, res) => {
    const uuid = req.body.payloadUuid;
    console.log('checking uuid send in req: ', uuid);
    try {
        const specificPropertiesFromPayloadSubscriptionResolution = await createXummPayloadSubscription(uuid);
        res.json(specificPropertiesFromPayloadSubscriptionResolution);
    } catch (error) {
        console.error('Error while verifying:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.addAuthenticatedWalletToUserProfile = async (userId, walletAddress) => {};

exports.signDocumentXrplTxCreation = async (req, res) => {
    //need wallet and document hash params for createPaymentTxWithDocHashInMemo function
};

exports.findAllXrplAccountPaymentTransactionsToSigVerifyWallet = async (req, res) => {
    try {
        const rAddress = req.body.rAddress;
        const arrayOfPaymentTransactionsWithMemoToSigVerifyAccount =
            await findAllAccountPaymentTransactionsToSigVerifyWallet(rAddress);
        //return array of all payment transactions from logged in account to sigVerify temp wallet
        res.json(arrayOfPaymentTransactionsWithMemoToSigVerifyAccount);
    } catch (err) {
        console.log(err);
        res.status(500).json({
            error: 'Internal Server Error inside findAllAccountPaymentTransactionsToSigVerifyWallet.',
        });
    }
};
