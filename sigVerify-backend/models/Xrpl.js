import { XummSdk } from 'xumm-sdk';
import dotenv from 'dotenv';
import { Client as XrplClient } from 'xrpl';
import xrpl from 'xrpl';

dotenv.config();

const sigverifyWallet = 'rMuU5YQaxChGsC6Tx1HGdCWxcqVxfEsTPo';

class XrplModel {
    constructor() {
        this.sdk = new XummSdk(process.env.XUMM_API_KEY, process.env.XUMM_API_SECRET);
        this.xrplClient = new XrplClient('wss://s.altnet.rippletest.net:51233/'); // Adjust the XRPL server URL as needed
    }

    convertUnixToReadableTime(rippleTime) {
        const unixTimestamp = rippleTime + 946684800;
        const dateObj = new Date(unixTimestamp * 1000);
        const readableDate = dateObj.toUTCString();
        return readableDate;
    }

    async createXamanSigninPayload() {
        try {
            const signInPayload = await this.sdk.payload.create({
                TransactionType: 'SignIn',
            });

            console.log('sign in payload create response: ', signInPayload);
            return {
                uuid: signInPayload?.uuid,
                qrLink: signInPayload?.next.always,
                qrImage: signInPayload?.refs.qr_png,
            };
        } catch (error) {
            console.error('Error while create sign-in payload: ', error);
        }
    }

    async createXamanPayloadSubscription(uuid) {
        console.log('checking uuid send in req: ', uuid);

        try {
            const subscription = await this.sdk.payload.subscribe(uuid, (event) => {
                if (Object.keys(event.data).indexOf('signed') > -1) {
                    return event.data;
                }
            });

            console.log('entire subscription response: ', subscription);

            const resolveData = await subscription.resolved;

            if (resolveData) {
                console.log(
                    'Open payload has now been finalized. Will now lookup tx UUID to return finalized tx data.'
                );
                const finalizedPayload = await this.sdk.payload.get(uuid);

                console.log('finalized payload data: ', finalizedPayload);

                return {
                    signed: finalizedPayload.meta.signed,
                    signer: finalizedPayload.response.signer,
                    userToken: finalizedPayload.response.user,
                    txHash: finalizedPayload.response.txid,
                    dispatchedResult: finalizedPayload.response.dispatched_result,
                };
            }
        } catch (error) {
            console.error('Error while verifying:', error);
        }
    }

    async createPaymentTxPayloadWithGivenDataInMemo(documentHash) {
        try {
            const authenticatedMarkedMemoToIdentifyAsSigverifySignature = {
                documentHash,
                marker: process.env.SIGNATURE_AUTHENTICATION_MARKER,
            };
            const jsonData = JSON.stringify(authenticatedMarkedMemoToIdentifyAsSigverifySignature);
            const signaturePaymentTxPayload = await this.sdk.payload.create({
                TransactionType: 'Payment',
                Destination: sigverifyWallet,
                Amount: '1',
                Memos: [
                    {
                        Memo: {
                            MemoData: xrpl.convertStringToHex(jsonData),
                        },
                    },
                ],
            });

            console.log('Signature payload active: ', signaturePaymentTxPayload);
            return {
                uuid: signaturePaymentTxPayload?.uuid,
                qrLink: signaturePaymentTxPayload?.next.always,
                qrImage: signaturePaymentTxPayload?.refs.qr_png,
            };
        } catch (error) {
            console.error('Error while creating paymentTxPayloadWithGivenDataInMemoResponse:', error.message);
        }
    }

    // TODO: need to fix to add custom memo filter for sigverify document 'marker'
    async findAllAccountPaymentTransactionsToSigVerifyWallet(rAddress) {
        console.log('rAddress in findAllAccountPaymentTransactionsToSigVerifyWallet: ', rAddress);

        try {
            await this.xrplClient.connect();
            const response = await this.xrplClient.request({
                id: 2,
                command: 'account_tx',
                account: rAddress,
                ledger_index_min: -1,
                ledger_index_max: -1,
                binary: false,
                forward: false,
            });
            await this.xrplClient.disconnect();

            const objectArray = response.result.transactions;
            let arrayOfPaymentTransactionsWithMemoToSigVerifyAccount = [];

            for (const object of objectArray) {
                //clean data to have exactly same properties on each object even if some have empty fields.
                if (object.tx.TransactionType === 'Payment' && object.tx.Destination === sigverifyWallet) {
                    const newObject = {
                        Signer: object.tx.Account ? object.tx.Account : '',
                        Amount: object.tx.Amount
                            ? (Math.round((object.tx.Amount / 1000000) * 100) / 100).toFixed(2)
                            : '',
                        Destination: object.tx.Destination ? object.tx.Destination : '',
                        DocumentHash: object.tx.Memos // TODO: this assumes the memo content is only the document hash, need to fix
                            ? xrpl.convertHexToString(object.tx.Memos[0].Memo.MemoData)
                            : false,
                        Fee: object.tx.Fee ? object.tx.Fee : '',
                        SigningPubKey: object.tx.SigningPubKey ? object.tx.SigningPubKey : '',
                        TransactionType: object.tx.TransactionType ? object.tx.TransactionType : '',
                        TransactionHash: object.tx.hash ? object.tx.hash : '',
                        date: object.tx.date ? this.convertUnixToReadableTime(object.tx.date) : '',
                    };
                    console.log(newObject);
                    arrayOfPaymentTransactionsWithMemoToSigVerifyAccount.push(newObject);
                }
            }

            //return array of all payment transactions from logged in account to sigVerify temp wallet
            return arrayOfPaymentTransactionsWithMemoToSigVerifyAccount;
        } catch (error) {
            console.error('Error while executing findAllAccountPaymentTransactionsToSigVerifyWallet:', error.message);
        }
    }

    async getReceivedPaymentTransactions(rAddress) {
        // const client = new xrpl.Client('wss://s.altnet.rippletest.net:51233'); //testnet
        console.log('finding payment transaction to: ', rAddress);

        try {
            await this.xrplClient.connect();
            const response = await this.xrplClient.request({
                id: 2,
                command: 'account_tx',
                account: rAddress,
                ledger_index_min: -1,
                ledger_index_max: -1,
                binary: false,
                forward: false,
            });
            await this.xrplClient.disconnect();

            const allTransactionsToWallet = response.result.transactions;

            let paymentTransactionsToWallet = [];

            for (const transaction of allTransactionsToWallet) {
                if (transaction.tx.TransactionType === 'Payment') {
                    paymentTransactionsToWallet.push(transaction);
                }
            }

            return paymentTransactionsToWallet; //array of objects
        } catch (error) {
            console.error('Error while executing findAllAccountPaymentTransactionsToSigVerifyWallet:', error.message);
        }
    }
}

export default XrplModel;
