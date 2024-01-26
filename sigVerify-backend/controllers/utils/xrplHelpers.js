import { XummSdk } from 'xumm-sdk';
import dotenv from 'dotenv';
import { Client as XrplClient } from 'xrpl';
import xrpl from 'xrpl';

dotenv.config();

const Sdk = new XummSdk(process.env.XUMM_API_KEY, process.env.XUMM_API_SECRET);

// current temp wallet that is recieving all signature transactions
const sigverifyWallet = 'rMuU5YQaxChGsC6Tx1HGdCWxcqVxfEsTPo';

const createXamanSigninPayload = async () => {
    try {
        const signInPayload = await Sdk.payload.create({
            TransactionType: 'SignIn',
        });

        console.log('sign in payload create response: ', signInPayload);
        const response = {
            uuid: signInPayload?.uuid,
            qrLink: signInPayload?.next.always,
            qrImage: signInPayload?.refs.qr_png,
        };

        return response;
    } catch (error) {
        console.error('Error while create sign-in payload: ', error);
    }
};

const createXamanPayloadSubscription = async (uuid) => {
    console.log('checking uuid send in req: ', uuid);

    try {
        console.log("Subscription helper is now listening to desired payload for 'signed' true event...");
        const subscription = await Sdk.payload.subscribe(uuid, (event) => {
            if (Object.keys(event.data).indexOf('signed') > -1) {
                return event.data;
            }
        });
        console.log('entire subscription response: ', subscription);

        const resolveData = await subscription.resolved;
        // entire 'resolveData' response:  {
        //     payload_uuidv4: '8862bbb3-a51a-4b00-a815-39c6ec372d2d',
        //     reference_call_uuidv4: '969bbbc4-8b4c-4c73-9bf2-e2a505efaa1e',
        //     signed: true,
        //     user_token: true,
        //     return_url: { app: null, web: null },
        //     txid: '2F0F4392AF4C5F1B8BB5BCA9D8616996745A940D7723C1D6F5B7AB57460FC988',
        //     opened_by_deeplink: true,
        //     custom_meta: { identifier: null, instruction: null }
        // }

        // only checking if the payload resolved property promise has resolved not if signed or rejected
        if (resolveData) {
            console.log('Open payload has now been finalized. Will now lookup tx UUID to return finalized tx data.');
            const finalizedPayload = await Sdk.payload.get(uuid);

            console.log('finalized payload data: ', finalizedPayload);
            console.log(`
            Resolved TX Data:
                Signed: ${finalizedPayload.meta.signed}
                Signed By: ${finalizedPayload.response.account},
                Signed User Token: ${finalizedPayload.response.user}
            `);

            const specificPropertiesFromPayloadSubscriptionResolution = {
                signed: finalizedPayload.meta.signed,
                signer: finalizedPayload.response.signer,
                userToken: finalizedPayload.response.user,
                txHash: finalizedPayload.response.txid,
                //tesSUCCESS for fully successful transaction submission to ledger
                dispatchedResult: finalizedPayload.response.dispatched_result,
            };

            return specificPropertiesFromPayloadSubscriptionResolution;
        }
    } catch (error) {
        console.error('Error while verifying:', error);
    }
};

const createPaymentTxPayloadWithGivenDataInMemo = async (rAddress, data) => {
    try {
        console.log('rAddress: ', rAddress);
        console.log('encryptedData: ', data);

        const paymentTxPayloadWithGivenDataInMemoResponse = await Sdk.payload.create({
            TransactionType: 'Payment',
            Account: rAddress.toString(),
            Destination: sigverifyWallet,
            Amount: '1',
            Fee: '12',
            Memos: [
                {
                    Memo: {
                        MemoData: xrpl.convertStringToHex(data),
                    },
                },
            ],
        });

        console.log('Transaction payload create response: ', paymentTxPayloadWithGivenDataInMemoResponse);
        const generatedPayload = {
            uuid: paymentTxPayloadWithGivenDataInMemoResponse?.uuid,
            qrLink: paymentTxPayloadWithGivenDataInMemoResponse?.next.always,
            qrImage: paymentTxPayloadWithGivenDataInMemoResponse?.refs.qr_png,
        };

        return generatedPayload;
    } catch (error) {
        console.error('Error while creating paymentTxPayloadWithGivenDataInMemoResponse:', error.message);
    }
};

//! currently deprecated, possible re-implementation
const findAllAccountPaymentTransactionsToSigVerifyWallet = async (rAddress) => {
    const client = new xrpl.Client('wss://s.altnet.rippletest.net:51233');

    const convertUnixToReadableTime = (rippleTime) => {
        const unixTimestamp = rippleTime + 946684800;
        const dateObj = new Date(unixTimestamp * 1000);
        const readableDate = dateObj.toUTCString();
        return readableDate;
    };

    console.log('rAddress in findAllAccountPaymentTransactionsToSigVerifyWallet: ', rAddress);

    try {
        await client.connect();
        const response = await client.request({
            id: 2,
            command: 'account_tx',
            account: rAddress,
            ledger_index_min: -1,
            ledger_index_max: -1,
            binary: false,
            forward: false,
        });
        await client.disconnect();

        const objectArray = response.result.transactions;
        let arrayOfPaymentTransactionsWithMemoToSigVerifyAccount = [];

        for (const object of objectArray) {
            //clean data to have exactly same properties on each object even if some have empty fields.
            if (
                object.tx.TransactionType === 'Payment' &&
                object.tx.Destination === 'rMuU5YQaxChGsC6Tx1HGdCWxcqVxfEsTPo'
            ) {
                const newObject = {
                    Signer: object.tx.Account ? object.tx.Account : '',
                    Amount: object.tx.Amount ? (Math.round((object.tx.Amount / 1000000) * 100) / 100).toFixed(2) : '',
                    Destination: object.tx.Destination ? object.tx.Destination : '',
                    DocumentHash: object.tx.Memos ? xrpl.convertHexToString(object.tx.Memos[0].Memo.MemoData) : false,
                    Fee: object.tx.Fee ? object.tx.Fee : '',
                    SigningPubKey: object.tx.SigningPubKey ? object.tx.SigningPubKey : '',
                    TransactionType: object.tx.TransactionType ? object.tx.TransactionType : '',
                    TransactionHash: object.tx.hash ? object.tx.hash : '',
                    date: object.tx.date ? convertUnixToReadableTime(object.tx.date) : '',
                };
                console.log(newObject);
                arrayOfPaymentTransactionsWithMemoToSigVerifyAccount.push(newObject);
            }
        }

        //return array of all payment transactions from logged in account to sigVerify temp wallet
        return arrayOfPaymentTransactionsWithMemoToSigVerifyAccount;
    } catch (err) {
        console.log(err);
    }
};

//! currently deprecated, possible re-implementation
const hasAccountSignedThisDocument = async (targetRAddress, documentHash) => {
    const client = new xrpl.Client('wss://s.altnet.rippletest.net:51233');

    const convertUnixToReadableTime = (rippleTime) => {
        const unixTimestamp = rippleTime + 946684800;
        const dateObj = new Date(unixTimestamp * 1000);
        const readableDate = dateObj.toUTCString();
        return readableDate;
    };

    console.log('rAddress in findAllAccountPaymentTransactionsToSigVerifyWallet: ', targetRAddress);

    try {
        await client.connect();
        const response = await client.request({
            id: 2,
            command: 'account_tx',
            account: targetRAddress,
            ledger_index_min: -1,
            ledger_index_max: -1,
            binary: false,
            forward: false,
        });
        await client.disconnect();

        const objectArray = response.result.transactions;
        let arrayOfPaymentTransactionsWithMemoToSigVerifyAccount = [];

        for (const object of objectArray) {
            //clean data to have exactly same properties on each object even if some have empty fields.
            if (
                object.tx.TransactionType === 'Payment' &&
                object.tx.Destination === 'rMuU5YQaxChGsC6Tx1HGdCWxcqVxfEsTPo' &&
                xrpl.convertHexToString(object.tx.Memos[0].Memo.MemoData) === documentHash
            ) {
                const newObject = {
                    Signer: object.tx.Account ? object.tx.Account : '',
                    Amount: object.tx.Amount ? (Math.round((object.tx.Amount / 1000000) * 100) / 100).toFixed(2) : '',
                    Destination: object.tx.Destination ? object.tx.Destination : '',
                    DocumentHash: object.tx.Memos ? xrpl.convertHexToString(object.tx.Memos[0].Memo.MemoData) : false,
                    Fee: object.tx.Fee ? object.tx.Fee : '',
                    SigningPubKey: object.tx.SigningPubKey ? object.tx.SigningPubKey : '',
                    TransactionType: object.tx.TransactionType ? object.tx.TransactionType : '',
                    TransactionHash: object.tx.hash ? object.tx.hash : '',
                    date: object.tx.date ? convertUnixToReadableTime(object.tx.date) : '',
                };
                console.log(newObject);
                arrayOfPaymentTransactionsWithMemoToSigVerifyAccount.push(newObject);
            }
        }

        //return array of all payment transactions from logged in account to sigVerify temp wallet
        return arrayOfPaymentTransactionsWithMemoToSigVerifyAccount;
    } catch (err) {
        console.log(err);
    }
};

export {
    createXamanSigninPayload,
    createXamanPayloadSubscription,
    findAllAccountPaymentTransactionsToSigVerifyWallet,
    createPaymentTxPayloadWithGivenDataInMemo,
    hasAccountSignedThisDocument,
};
