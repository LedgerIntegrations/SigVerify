import crypto from 'crypto';
import { createTransactionPayload, hasAccountSignedThisDocument } from '../utils/xrplHelpers.js';

// hashes document and creates payment payload with doc hash to sign.
// returns object with tx identifiers(qr, link, uuid)
export const signDocument = async (req, res) => {
    const rAddress = req.body.rAddress;
    try {
        console.log(req.file); // The uploaded file data is available in req.file
        const document = req.file.buffer; // Buffer of the uploaded file

        if (!document) {
            return res.status(400).json({ error: 'No document provided' });
        }

        // Create a hash of the document
        const hash = crypto.createHash('sha256').update(document).digest();
        const base64DocHash = hash.toString('base64');
        //create Xaman payment tx with doc hash in memo and destination as sigVerifyWallet
        const newPaymentTxPayloadObject = await createTransactionPayload(rAddress, base64DocHash);

        res.json(newPaymentTxPayloadObject);
    } catch (error) {
        console.error('Error while signing:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const verifySignature = async (req, res) => {
    try {
        const targetRAddress = req.body.targetRAddress;
        console.log(req.file); // uploaded file data is available in req.file
        const document = req.file.buffer; // Buffer of the uploaded file

        if (!document) {
            return res.status(400).json({ error: 'No document provided' });
        }

        // Create a hash of the document
        const hash = crypto.createHash('sha256').update(document).digest();
        const base64DocHash = hash.toString('base64');

        const returnedArrayOfTxThatMatch = await hasAccountSignedThisDocument(targetRAddress, base64DocHash);

        res.json(returnedArrayOfTxThatMatch);
    } catch (error) {
        console.error('Error while signing:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
