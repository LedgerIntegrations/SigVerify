const { XummSdk } = require('xumm-sdk');
require('dotenv').config();
const Sdk = new XummSdk(process.env.XUMM_API_KEY, process.env.XUMM_API_SECRET);
const xrpl = require('xrpl');
//current temp wallet
const sigverifyWallet = "rMuU5YQaxChGsC6Tx1HGdCWxcqVxfEsTPo";

exports.createXummSigninPayload = async (req, res) => {
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

        res.json(response);

    } catch (error) {
        console.error("Error while create sign-in payload: ", error);
        res.status(500).json({ error: "Internal Server Error in createXummSigninPayload controller." });
    }
};

exports.subscribeToPayload = async (req, res) => {
    const uuid = req.body.payloadUuid;
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

            const pluckedPayloadProperties = {
                loggedIn: payload.meta.signed,
                wallet: payload.response.account,
                userToken: payload.response.user
            };

            res.json(pluckedPayloadProperties);
        };
    } catch (error) {
        console.error("Error while verifying:", error);
        res.status(500).json({ error: "Internal Server Error" });
    };
};

exports.createTransactionPayload = async (rAddress, documentHash) => {
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

    exports.findAllAccountPaymentTransactionsToSigVerifyWalletMemoDocumentHashes = async (accountRAddress) => {

        const convertUnixToReadableTime = (rippleTime) => {
            const unixTimestamp = rippleTime + 946684800;
            const dateObj = new Date(unixTimestamp * 1000);
            const readableDate = dateObj.toUTCString();
            return readableDate;
        }

        await client.connect();
        const response = await client.request({
            "id": 2,
            "command": "account_tx",
            "account": accountRAddress,
            "ledger_index_min": -1,
            "ledger_index_max": -1,
            "binary": false,
            "forward": false
        });
        await client.disconnect();
        const objectArray = response.result.transactions;
        let arrayOfPaymentTransactionToSigVerifyAccount = [];
        for (const object of objectArray) {
            //clean data to have exactly same properties on each object even if some have empty fields.
            if (object.tx.TransactionType === "Payment" && object.tx.Destination === "rMuU5YQaxChGsC6Tx1HGdCWxcqVxfEsTPo") {
                const newObject = {
                    Account: object.tx.Account ? object.tx.Account : "",
                    Amount: object.tx.Amount ? (Math.round((object.tx.Amount / 1000000) * 100) / 100).toFixed(2) : "",
                    Destination: object.tx.Destination ? object.tx.Destination : "",
                    Memo: object.tx.Memos ? object.tx.Memos : false,
                    Fee: object.tx.Fee ? object.tx.Fee : "",
                    LastLedgerSequence: object.tx.LastLedgerSequence ? object.tx.LastLedgerSequence : "",
                    Sequence: object.tx.Sequence ? object.tx.Sequence : "",
                    SigningPubKey: object.tx.SigningPubKey ? object.tx.SigningPubKey : "",
                    TransactionType: object.tx.TransactionType ? object.tx.TransactionType : "",
                    TxnSignature: object.tx.TxnSignature ? object.tx.TxnSignature : "",
                    hash: object.tx.hash ? object.tx.hash : "",
                    ledger_index: object.tx.ledger_index ? object.tx.ledger_index : "",
                    date: object.tx.date ? convertUnixToReadableTime(object.tx.date) : ""
                };
                arrayOfPaymentTransactionToSigVerifyAccount.push(newObject);
            };
        };

        // console.log("newObjectArray: ", arrayOfPaymentTransactionToSigVerifyAccount)
        const accountMemosHashes = [];
        arrayOfPaymentTransactionToSigVerifyAccount.forEach(obj => { if (obj.Memo) { accountMemosHashes.push(xrpl.convertHexToString(obj.Memo[0].Memo.MemoData)) } });
        //return array of all document hashes as strings from this accounts payment txs to sigVerify wallet
        return accountMemosHashes;
    }
}