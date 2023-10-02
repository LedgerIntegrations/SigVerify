const { XummSdk } = require('xumm-sdk');
require('dotenv').config();
const Sdk = new XummSdk(process.env.XUMM_API_KEY, process.env.XUMM_API_SECRET);

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