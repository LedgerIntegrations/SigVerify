const crypto = require('crypto');
const Document = require('../models/Document');
const mongooseConnect = require('../config/mongooseConnect');

const { createTransactionPayload, hasAccountSignedThisDocument } = require('../controllers/userController')

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

        const paymentTxPayloadObject = await createTransactionPayload(rAddress, base64DocHash);

        res.json(paymentTxPayloadObject);

    } catch (error) {
        console.error("Error while signing:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

//NEEDS TO BE IMPLEMENTED -> REMOVED OLD SIG VERIFY
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
    }
};

exports.uploadFileToDb = async (req, res) => {
    
    try {
        const targetRAddress = req.body.targetRAddress;
        console.log("targetRAddress: ",targetRAddress);
        console.log("req.file: ",req.file);  // The uploaded file data is available in req.file
        const document = req.file.buffer; // Buffer of the uploaded file
        console.log("document: ", document)
        if (!document) {
            return res.status(400).json({ error: "No document provided" });
        };

        await mongooseConnect();
    // filename: String,
    // filedata: Buffer,
    // contentType: String,
    // fromWallet: String
        const documentCreate = Document.create({filename: req.file.originalname, filedata: req.file.buffer, contentType: req.file.mimetype, fromWallet: targetRAddress});
        res.json(documentCreate);


    } catch (error) {
        console.error("Error while uploading file", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
