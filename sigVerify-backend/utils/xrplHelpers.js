const { XummSdk } = require('xumm-sdk');
require('dotenv').config();
const Sdk = new XummSdk(process.env.XUMM_API_KEY, process.env.XUMM_API_SECRET);
const xrpl = require('xrpl');

//current temp wallet
const sigverifyWallet = "rMuU5YQaxChGsC6Tx1HGdCWxcqVxfEsTPo";

exports.createXummSigninPayload = async () => {
    try {
        const signInPayload = await Sdk.payload.create({
            'TransactionType': 'SignIn'
        });

        console.log("sign in payload create response: ", signInPayload);
        const response = {
            uuid: signInPayload?.uuid,
            qrLink: signInPayload?.next.always,
            qrImage: signInPayload?.refs.qr_png
        };

        return response;

    } catch (error) {
        console.error("Error while create sign-in payload: ", error);
    };
};

exports.createXummPayloadSubscription = async (uuid) => {
    console.log("checking uuid send in req: ", uuid);

    try {
        console.log("Subscription helper is now listening to desired payload for 'signed' true event...")
        const subscription = await Sdk.payload.subscribe(uuid, (event) => {
            if (Object.keys(event.data).indexOf('signed') > -1) {
                return event.data;
            };
        });

        const resolveData = await subscription.resolved;

        if (resolveData) {
            console.log("Subscribed payload has resolved. Will now lookup tx UUID to return resolved tx data.")
            const payload = await Sdk.payload.get(uuid);
            console.log(`
            Resolved TX Data:
                Signed: ${payload.meta.signed}
                Signed By: ${payload.response.account},
                Signed User Token: ${payload.response.user}
            `);

            const specificPropertiesFromPayloadSubscriptionResolution =
              {
                loggedIn: payload.meta.signed,
                verifiedXrplWalletAddress: payload.response.account,
                userToken: payload.response.user,
              };

            return specificPropertiesFromPayloadSubscriptionResolution;
        };
    } catch (error) {
        console.error("Error while verifying:", error);
    };
};

exports.createPaymentTxWithDocHashInMemo = async (rAddress, documentHash) => {
    try {
        console.log("rAddress: ", rAddress);
        console.log("document hash: ", documentHash);

        const txPayloadForPaymentToSelfWithDocHashInMemo = await Sdk.payload.create({
            "TransactionType": "Payment",
            "Account": rAddress.toString(),
            "Destination": sigverifyWallet,
            "Amount": "1",
            "Fee": "12",
            "Memos": [
                {
                    "Memo": {
                        "MemoData": xrpl.convertStringToHex(documentHash)
                    }
                }
            ]
        });

        console.log("Transaction payload create response: ", txPayloadForPaymentToSelfWithDocHashInMemo);
        const response = {
            documentHash: documentHash,
            uuid: txPayloadForPaymentToSelfWithDocHashInMemo?.uuid,
            qrLink: txPayloadForPaymentToSelfWithDocHashInMemo?.next.always,
            qrImage: txPayloadForPaymentToSelfWithDocHashInMemo?.refs.qr_png
        };

        return response;

    } catch (error) {
        console.error("Error while creating payment transaction:", error.message);
    };
};

exports.findAllAccountPaymentTransactionsToSigVerifyWallet = async (rAddress) => {
    const client = new xrpl.Client('wss://s.altnet.rippletest.net:51233');

    const convertUnixToReadableTime = (rippleTime) => {
        const unixTimestamp = rippleTime + 946684800;
        const dateObj = new Date(unixTimestamp * 1000);
        const readableDate = dateObj.toUTCString();
        return readableDate;
    };

    console.log("rAddress in findAllAccountPaymentTransactionsToSigVerifyWallet: ", rAddress);

    try {
        await client.connect();
        const response = await client.request({
            "id": 2,
            "command": "account_tx",
            "account": rAddress,
            "ledger_index_min": -1,
            "ledger_index_max": -1,
            "binary": false,
            "forward": false
        });
        await client.disconnect();

        const objectArray = response.result.transactions;
        let arrayOfPaymentTransactionsWithMemoToSigVerifyAccount = [];

        for (const object of objectArray) {
            //clean data to have exactly same properties on each object even if some have empty fields.
            if (object.tx.TransactionType === "Payment" && object.tx.Destination === "rMuU5YQaxChGsC6Tx1HGdCWxcqVxfEsTPo") {
                const newObject = {
                    Signer: object.tx.Account ? object.tx.Account : "",
                    Amount: object.tx.Amount ? (Math.round((object.tx.Amount / 1000000) * 100) / 100).toFixed(2) : "",
                    Destination: object.tx.Destination ? object.tx.Destination : "",
                    DocumentHash: object.tx.Memos ? xrpl.convertHexToString(object.tx.Memos[0].Memo.MemoData) : false, Fee: object.tx.Fee ? object.tx.Fee : "",
                    SigningPubKey: object.tx.SigningPubKey ? object.tx.SigningPubKey : "",
                    TransactionType: object.tx.TransactionType ? object.tx.TransactionType : "",
                    TransactionHash: object.tx.hash ? object.tx.hash : "",
                    date: object.tx.date ? convertUnixToReadableTime(object.tx.date) : ""
                };
                console.log(newObject)
                arrayOfPaymentTransactionsWithMemoToSigVerifyAccount.push(newObject);
            };
        };

        //return array of all payment transactions from logged in account to sigVerify temp wallet
        return arrayOfPaymentTransactionsWithMemoToSigVerifyAccount;
    } catch (err) {
        console.log(err);
    };
};

exports.hasAccountSignedThisDocument = async (targetRAddress, documentHash) => {

    const client = new xrpl.Client('wss://s.altnet.rippletest.net:51233');

    const convertUnixToReadableTime = (rippleTime) => {
        const unixTimestamp = rippleTime + 946684800;
        const dateObj = new Date(unixTimestamp * 1000);
        const readableDate = dateObj.toUTCString();
        return readableDate;
    };

    console.log("rAddress in findAllAccountPaymentTransactionsToSigVerifyWallet: ", targetRAddress);

    try {

        await client.connect();
        const response = await client.request({
            "id": 2,
            "command": "account_tx",
            "account": targetRAddress,
            "ledger_index_min": -1,
            "ledger_index_max": -1,
            "binary": false,
            "forward": false
        });
        await client.disconnect();

        const objectArray = response.result.transactions;
        let arrayOfPaymentTransactionsWithMemoToSigVerifyAccount = [];

        for (const object of objectArray) {
            //clean data to have exactly same properties on each object even if some have empty fields.
            if (object.tx.TransactionType === "Payment" && object.tx.Destination === "rMuU5YQaxChGsC6Tx1HGdCWxcqVxfEsTPo" && (xrpl.convertHexToString(object.tx.Memos[0].Memo.MemoData) === documentHash)) {
                const newObject = {
                    Signer: object.tx.Account ? object.tx.Account : "",
                    Amount: object.tx.Amount ? (Math.round((object.tx.Amount / 1000000) * 100) / 100).toFixed(2) : "",
                    Destination: object.tx.Destination ? object.tx.Destination : "",
                    DocumentHash: object.tx.Memos ? xrpl.convertHexToString(object.tx.Memos[0].Memo.MemoData) : false,
                    Fee: object.tx.Fee ? object.tx.Fee : "",
                    SigningPubKey: object.tx.SigningPubKey ? object.tx.SigningPubKey : "",
                    TransactionType: object.tx.TransactionType ? object.tx.TransactionType : "",
                    TransactionHash: object.tx.hash ? object.tx.hash : "",
                    date: object.tx.date ? convertUnixToReadableTime(object.tx.date) : ""
                };
                console.log(newObject)
                arrayOfPaymentTransactionsWithMemoToSigVerifyAccount.push(newObject);
            };
        };

        //return array of all payment transactions from logged in account to sigVerify temp wallet
        return arrayOfPaymentTransactionsWithMemoToSigVerifyAccount;
    } catch (err) {
        console.log(err);
    };
};
