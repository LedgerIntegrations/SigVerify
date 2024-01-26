import {
    createXamanSigninPayload as createXamanSigninPayloadHelper,
    createXamanPayloadSubscription as createXamanPayloadSubscriptionHelper,
    findAllAccountPaymentTransactionsToSigVerifyWallet as findAllAccountPaymentTransactionsToSigVerifyWalletHelper,
    createPaymentTxPayloadWithGivenDataInMemo,
} from './utils/index.js';

const createXamanSigninPayload = async (req, res) => {
    try {
        const response = await createXamanSigninPayloadHelper();
        res.json(response);
    } catch (error) {
        console.error('Error while create sign-in payload: ', error);
        res.status(500).json({
            error: 'Internal Server Error in createXamanSigninPayload controller.',
        });
    }
};

//responds back to client with specificPropertiesFromPayloadSubscriptionResolution
const createXamanPayloadSubscription = async (req, res) => {
    const uuid = req.body.payloadUuid;
    console.log('checking uuid send in req: ', uuid);
    try {
        const specificPropertiesFromPayloadSubscriptionResolution = await createXamanPayloadSubscriptionHelper(uuid);
        res.json(specificPropertiesFromPayloadSubscriptionResolution);
    } catch (error) {
        console.error('Error while verifying:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const generateXamanPayloadForPaymentTxWithMemo = async (req, res) => {
    const { userRAddress, memoData } = req.body;

    try {
        const response = await createPaymentTxPayloadWithGivenDataInMemo(userRAddress, memoData);
        res.json(response);
    } catch (error) {
        console.error('Error while executing signEncryptedJsonData: ', error);
        res.status(500).json({
            error: 'Internal Server Error in signEncryptedJsonData controller.',
        });
    }
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
    createXamanSigninPayload,
    createXamanPayloadSubscription,
    generateXamanPayloadForPaymentTxWithMemo,
    findAllXrplAccountPaymentTransactionsToSigVerifyWallet,
};
