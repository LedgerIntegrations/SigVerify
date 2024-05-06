// controllers/signatureController.js

import SignatureModel from '../models/Signature.js';
import DocumentModel from '../models/Document.js';
import DocumentAccessModel from '../models/DocumentAccess.js';

const checkAccess = async (documentId, userEmail) => {
    const accessObjects = await DocumentAccessModel.getAccessObjectsByDocumentId(documentId);
    return accessObjects.some((object) => object.email === userEmail);
};

// signature controllers
export const storeResolvedSignature = async (req, res) => {
    const { documentId, xrplTxHash, signerWalletAddress, documentChecksum } = req.body;

    if (!documentId || !xrplTxHash || !signerWalletAddress || !documentChecksum) {
        return res.status(400).json({ message: 'Missing required fields.' });
    }

    try {
        const signature = await SignatureModel.signDocument(req.body);
        if (signature !== null) {
            res.status(201).json({ message: 'Signature stored successfully', signature });
        }
    } catch (error) {
        console.error('Failed to store resolved signature to database:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getDocumentSignatures = async (req, res) => {
    // Document is already fetched and stored in req by middleware
    const document = req.document;

    try {
        if (document.public || (req.user && checkAccess(document.id, req.user.email))) {
            const signatures = await SignatureModel.getSignaturesByDocumentId(document.id);
            return res.status(200).json({ signatures });
        } else {
            return res.status(403).json({ message: 'Forbidden: You do not have access to this document.' });
        }
    } catch (error) {
        console.error('Error occurred in signature lookup:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const getSignaturesByUserProfileId = async (req, res) => {
    try {
        const userProfileId = req.user.profileId;

        if (!userProfileId) {
            return res
                .status(401)
                .json({ message: 'Unauthorized: You must be logged in to get all your account signatures!' });
        }

        const signatures = await SignatureModel.getSignaturesByUserProfileId(userProfileId);
        return res.status(200).json({ signatures });
    } catch (error) {
        console.error('Error occurred fetching signatures:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const getDocumentSignatureStatus = async (req, res) => {
    const { documentId } = req.params;

    // Check if the documentId parameter is provided
    if (!documentId) {
        return res.status(400).json({ message: 'Missing document id to query.' });
    }

    try {
        // if document is still being processed (private and can_add_access still)
        const document = await DocumentModel.getAnyDocumentById(documentId);

        if (!document) {
            return res.status(400).json({ message: 'This document does not exist, or was not found.' });
        }

        if (!document.public && document.can_add_access) {
            return res.status(200).json({
                signatureStatus: 'edit',
            });
        }

        const documentSignatures = await SignatureModel.getSignaturesByDocumentId(documentId);
        const documentAccessObjects = await DocumentAccessModel.getAccessObjectsByDocumentId(documentId);

        if (documentSignatures.length === documentAccessObjects.length) {
            return res.status(200).json({
                signatureStatus: 'complete',
            });
        }

        return res.status(200).json({
            signatureStatus: 'pending',
        });
    } catch (error) {
        // Log the error and respond with a generic server error message
        console.error('Error occurred trying to lookup signature status for this document:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};
