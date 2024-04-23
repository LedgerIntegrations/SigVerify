import XrplModel from '../models/Xrpl.js';
import DocumentModel from '../models/Document.js';

const xrplModel = new XrplModel();
const sigverifyWallet = 'rMuU5YQaxChGsC6Tx1HGdCWxcqVxfEsTPo';

const createXamanSigninPayload = async (req, res) => {
    try {
        const response = await xrplModel.createXamanSigninPayload();
        if (response) {
            res.json(response);
        } else {
            throw new Error('Failed to create sign-in payload');
        }
    } catch (error) {
        console.error('Error while create sign-in payload: ', error);
        res.status(500).json({
            error: 'Internal Server Error in createXamanSigninPayload controller.',
        });
    }
};

const createXamanPayloadSubscription = async (req, res) => {
    const uuid = req.body.payloadUuid;
    console.log('checking uuid send in req: ', uuid);
    try {
        const specificPropertiesFromPayloadSubscriptionResolution = await xrplModel.createXamanPayloadSubscription(
            uuid
        );
        if (specificPropertiesFromPayloadSubscriptionResolution) {
            res.json(specificPropertiesFromPayloadSubscriptionResolution);
        } else {
            throw new Error('Failed to subscribe to payload');
        }
    } catch (error) {
        console.error('Error while verifying:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const generateXamanPayloadForPaymentTxWithMemo = async (req, res) => {
    const { documentHash } = req.body;

    try {
        const response = await xrplModel.createPaymentTxPayloadWithGivenDataInMemo(documentHash);
        if (response) {
            res.json(response);
        } else {
            throw new Error('Failed to create payment transaction payload with memo');
        }
    } catch (error) {
        console.error('Error while executing generateXamanPayloadForPaymentTxWithMemo: ', error);
        res.status(500).json({
            error: 'Internal Server Error in generateXamanPayloadForPaymentTxWithMemo controller.',
        });
    }
};

const findAllXrplAccountPaymentTransactionsToSigVerifyWallet = async (req, res) => {
    try {
        const rAddress = req.body.rAddress;
        const arrayOfPaymentTransactionsWithMemoToSigVerifyAccount =
            await xrplModel.findAllAccountPaymentTransactionsToSigVerifyWallet(rAddress);
        //return array of all payment transactions from logged in account to sigVerify temp wallet
        res.json(arrayOfPaymentTransactionsWithMemoToSigVerifyAccount);
    } catch (err) {
        console.log(err);
        res.status(500).json({
            error: 'Internal Server Error inside findAllAccountPaymentTransactionsToSigVerifyWallet.',
        });
    }
};

const getReceivedPaymentTransactions = async (req, res) => {
    const { wallet } = req.params;

    try {
        const paymentTransactionsToWallet = await xrplModel.getReceivedPaymentTransactions(rAddress);
        res.json(paymentTransactionsToWallet);
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
    getReceivedPaymentTransactions,
};