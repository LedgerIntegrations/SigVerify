// SigVerify/sigVerify-backend/controllers/documentControllers.js

import DocumentsModel from '../models/DocumentsModel.js';
import { returnSignedUrlFromS3BucketKey } from '../config/s3Bucket.js';
import { pinata } from '../config/pinataConnect.js';
import crypto from 'crypto';

//* Helper function: returns crypto module sha256 hash of given string (used for email)
async function hashStringUsingSha256(string) {
    return crypto.createHash('sha256').update(string).digest('hex');
}

const storeNewDocumentDataToIpfsAndDatabase = async (req, res) => {
    try {
        //* Extract and process data from request body
        const {
            originalFileName,
            originalFileFormat,
            originalFileSize,
            base64EncodedSha512HashOfOriginalFileArrayBuffer,
            requiredSignersWallets,
            author,
            metadata,
            encrypted,
            data,
        } = req.body;

        let allInvolvedEmailsArray = encrypted ? Object.keys(data.accessControls) : data.accessControls;

        //* Construct the metadata object based on encrypted or unencrypted schema
        let documentMetadata = {
            schema: encrypted
                ? 'ipfs://Qma6Tnpzycw36LhFarF8gEwFRWrLSxmosi27S6Mh8zSBxn'
                : 'ipfs://QmZytGcRCzrDVTnMrfD1xbznz38HtiyoSCPLwRvGqY5Mty',
            nftType: encrypted ? 'encrypted_document.v0' : 'document.v0',
            name: metadata.title || 'Untitled Document',
            description: metadata.description || 'No description provided',
            image: 'ipfs://QmcqQ4W2pFFuQg5jcdzBXE9Jm566yCgX43dDwhQsKzKKnF',
            collection: {
                name: 'SigVerify Document Collection',
                family: encrypted ? 'encrypted_document' : 'document',
            },
            encrypted: encrypted,
            author: author,
            requiredSignersWallets: requiredSignersWallets.join(', '),
            document: {
                originalFileName,
                originalFileFormat,
                originalFileSize,
                originalFileHash: base64EncodedSha512HashOfOriginalFileArrayBuffer,
                metadata,
                data,
            },
        };

        const ipfsResponse = await pinata.pinJSONToIPFS(documentMetadata);
        const ipfsHash = ipfsResponse.IpfsHash;

        const newDocumentId = await DocumentsModel.storeNewDocument(req.user.userId, {
            title: metadata.title,
            description: metadata.description,
            category: metadata.category,
            encrypted,
            documentName: originalFileName,
            documentType: originalFileFormat,
            documentSize: originalFileSize,
            requiredSignersWallets,
            allInvolvedHashedEmails: allInvolvedEmailsArray,
            ipfsHash,
        });

        res.status(200).json({
            message: 'Document stored and recorded successfully',
            documentId: newDocumentId,
            ipfsHash: ipfsHash,
        });
    } catch (error) {
        console.error('Error in storeNewDocumentDataToIpfs:', error);
        res.status(500).send('Error processing request');
    }
};

const addDocumentSignature = async (req, res) => {
    const { docId, xrplTxHash } = req.body;

    try {
        const newSignatureId = await DocumentsModel.addDocumentSignature(docId, req.user.userId, xrplTxHash);
        res.status(200).json({
            message: 'Signature stored and recorded successfully',
            newSignatureId,
        });
    } catch (error) {
        console.error('Error in addDocumentSignature:', error);
        res.status(500).send('Error processing request');
    }
};

const getAllUserDocumentsWithSignatureStatus = async (req, res) => {
    try {
        const hashedEmail = await hashStringUsingSha256(req.user.email);
        const documents = await DocumentsModel.getAllUserDocumentsWithSignatureStatus(req.user.userId, hashedEmail);
        res.json(documents);
    } catch (error) {
        console.error('Error fetching documents with signature status:', error);
        res.status(500).send('Internal Server Error');
    }
};

const hasUserSignedDocument = async (req, res) => {
    const { docId } = req.query; // Assuming docId is passed as a query parameter

    try {
        const hasSigned = await DocumentsModel.hasUserSignedDocument(docId, req.user.userId);
        res.json({ hasSigned });
    } catch (error) {
        console.error('Error checking document signature:', error);
        res.status(500).send('Error processing request');
    }
};

export {
    storeNewDocumentDataToIpfsAndDatabase,
    addDocumentSignature,
    getAllUserDocumentsWithSignatureStatus,
    hasUserSignedDocument,
};
