const crypto = require('crypto');

const { createTransactionPayload } = require('../controllers/userController')

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
exports.verifySignature = (req, res) => {
    try {
        
    } catch (error) {
        console.error("Error while verifying:", error);
        res.status(500).json({ error: "Internal Server Error" });
    };
};
