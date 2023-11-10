const crypto = require('crypto');
// const Document = require('../models/Document');
// const mongooseConnect = require('../config/mongooseConnect');

const { createTransactionPayload, hasAccountSignedThisDocument } = require('../utils/xrplHelpers');

// recieves formData file
// hashes document and creates payment payload with doc hash to sign.
// returns object with tx identifiers(qr, link, uuid)
exports.signDocument = async (req, res) => {
    const rAddress = req.body.rAddress;
    try {
        console.log(req.file);  // The uploaded file data is available in req.file
        const document = req.file.buffer; // Buffer of the uploaded file

        if (!document) {
            return res.status(400).json({ error: "No document provided" });
        };

        // Create a hash of the document
        const hash = crypto.createHash('sha256').update(document).digest();
        const base64DocHash = hash.toString('base64');
        //create xumm payment tx with doc hash in memo and destination as sigVerifyWallet
        const newPaymentTxPayloadObject = await createTransactionPayload(rAddress, base64DocHash);

        res.json(newPaymentTxPayloadObject);

    } catch (error) {
        console.error("Error while signing:", error);
        res.status(500).json({ error: "Internal Server Error" });
    };
};

// recieves formData file
// searches target rAddress for payment tx with destination of sigVerifyWallet and memo matching hash of given document
// returns array, empty if none found, populated if found
exports.verifySignature = async (req, res) => {
    try {
        const targetRAddress = req.body.targetRAddress
        console.log(req.file);  // The uploaded file data is available in req.file
        const document = req.file.buffer; // Buffer of the uploaded file

        if (!document) {
            return res.status(400).json({ error: "No document provided" });
        };

        // Create a hash of the document
        const hash = crypto.createHash('sha256').update(document).digest();
        const base64DocHash = hash.toString('base64');

        const returnedArrayOfTxThatMatch = await hasAccountSignedThisDocument(targetRAddress, base64DocHash);

        res.json(returnedArrayOfTxThatMatch);

    } catch (error) {
        console.error("Error while signing:", error);
        res.status(500).json({ error: "Internal Server Error" });
    };
};

// recieves formData file
// create new sigVerify DB documents collection entry with file data and users rAddress attached to 'fromWallet' property
// exports.uploadFileToDb = async (req, res) => {  
//     try {
//         const targetRAddress = req.body.targetRAddress;
//         console.log("targetRAddress: ", targetRAddress);
//         console.log("req.file: ", req.file);  // The uploaded file data is available in req.file
//         const document = req.file.buffer; // Buffer of the uploaded file
//         console.log("document: ", document)
//         if (!document) {
//             return res.status(400).json({ error: "No document provided" });
//         };

//         await mongooseConnect();
//         const documentCreate = await Document.create({filename: req.file.originalname, filedata: req.file.buffer, contentType: req.file.mimetype, fromWallet: targetRAddress});
//         res.json(documentCreate);

//     } catch (error) {
//         console.error("Error while uploading file", error);
//         res.status(500).json({ error: "Internal Server Error" });
//     };
// };

// // query sigVerify db documents collection for all users uploaded documents
// exports.getAllDocumentsUploadedByThisWallet = async (req, res) => {
//     const userWalletRAddress = req.body.wallet
//     try {
//         await mongooseConnect();
//         const documents = await Document.find({ fromWallet: userWalletRAddress }); // Query all documents in your collection with users address as fromWallet value
//         res.json(documents);
//     } catch (error) {
//         console.error("Error while uploading file", error);
//         res.status(500).json({ error: "Internal Server Error" });
//     };
// };