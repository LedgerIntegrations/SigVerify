import {
    createXummSigninPayload as createXummSigninPayloadHelper,
    createXummPayloadSubscription as createXummPayloadSubscriptionHelper,
    findAllAccountPaymentTransactionsToSigVerifyWallet as findAllAccountPaymentTransactionsToSigVerifyWalletHelper,
    createPaymentTxWithDocHashInMemo as createPaymentTxWithDocHashInMemoHelper,
} from './utils/index.js';

const createXummSigninPayload = async (req, res) => {
    try {
        const response = await createXummSigninPayloadHelper();
        res.json(response);
    } catch (error) {
        console.error('Error while create sign-in payload: ', error);
        res.status(500).json({
            error: 'Internal Server Error in createXummSigninPayload controller.',
        });
    }
};

//responds back to client with specificPropertiesFromPayloadSubscriptionResolution
const createXummPayloadSubscription = async (req, res) => {
    const uuid = req.body.payloadUuid;
    console.log('checking uuid send in req: ', uuid);
    try {
        const specificPropertiesFromPayloadSubscriptionResolution = await createXummPayloadSubscriptionHelper(uuid);
        res.json(specificPropertiesFromPayloadSubscriptionResolution);
    } catch (error) {
        console.error('Error while verifying:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const addAuthenticatedWalletToUserProfile = async (userId, walletAddress) => {};

const signDocumentXrplTxCreation = async (req, res) => {
    //need wallet and document hash params for createPaymentTxWithDocHashInMemo function
};

const findAllXrplAccountPaymentTransactionsToSigVerifyWallet = async (req, res) => {
    try {
        const rAddress = req.body.rAddress;
        const arrayOfPaymentTransactionsWithMemoToSigVerifyAccount =
            await findAllAccountPaymentTransactionsToSigVerifyWalletHelper(rAddress);
        //return array of all payment transactions from logged in account to sigVerify temp wallet
        res.json(arrayOfPaymentTransactionsWithMemoToSigVerifyAccount);
    } catch (err) {
        console.log(err);
        res.status(500).json({
            error: 'Internal Server Error inside findAllAccountPaymentTransactionsToSigVerifyWallet.',
        });
    }
};

export {
    createXummSigninPayload,
    createXummPayloadSubscription,
    addAuthenticatedWalletToUserProfile,
    signDocumentXrplTxCreation,
    findAllXrplAccountPaymentTransactionsToSigVerifyWallet,
};
