// SigVerify/sigVerify-backend/controllers/documentControllers.js

import { returnSignedUrlFromS3BucketKey } from '../config/s3Bucket.js';
import { pinata } from '../config/pinataConnect.js';
import crypto from 'crypto';
import DocumentModel from '../models/Document.js';
import DocumentAccessModel from '../models/DocumentAccess.js';
import SignatureModel from '../models/Signature.js';
import UserModel from '../models/User.js';

//* Helper function: returns crypto module sha256 hash of given string (used for email)
async function hashStringUsingSha256(string) {
    return crypto.createHash('sha256').update(string).digest('hex');
}

//* PUBLIC FUNCTIONALITY
const getPublicDocumentsByUserEmail = async (req, res) => {
    try {
        const publicDocumentsRes = await DocumentModel.getPublicDocumentsByUserEmail(req.params.userEmail);
        console.log(publicDocumentsRes);
        if (!publicDocumentsRes || publicDocumentsRes.length === 0) {
            return res.json([]);
        }

        // Map each documentId to a Promise of fetching the document data
        const docsPromises = publicDocumentsRes.map(async (document) => {
            const { s3_object_key, s3_object_url, ...connectedBlob } = await DocumentModel.getDocumentBlobByDocumentId(
                document.id
            );

            const uploaderEmail = await UserModel.getEmailByProfileId(document.user_profile_id);

            if (uploaderEmail !== req.params.userEmail) {
                return;
            }

            return {
                ...document,
                accessObjects: null,
                uploader_email: uploaderEmail,
                blob: connectedBlob,
            };
        });

        // Wait for all Promises to resolve
        const docsResult = await Promise.all(docsPromises);

        res.json(docsResult);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getPublicDocument = async (req, res) => {
    const documentId = req.params.documentId;

    try {
        const document = await DocumentModel.getAnyDocumentById(documentId);

        if (!document) {
            return res.status(404).send('Document not found.');
        }

        // Check if the document is public or if the requesting user is the owner
        if (document.public) {
            const preSignedUrl = await returnSignedUrlFromS3BucketKey(document.s3_object_key);
            const { s3_object_key, s3_object_url, ...parsedDocument } = document;
            res.json({ meta: parsedDocument, preSignedUrl });
        } else {
            // If the document is private and the user is not the owner, request login
            res.status(403).send('Access denied. This document is private.');
        }
    } catch (err) {
        console.error('Error getting document:', err);
        res.status(500).send('Internal server error.');
    }
};

//* LOGGED IN
const uploadDocumentAndStoreDetails = async (req, res) => {
    try {
        const profileId = req.user.profileId; // Applied by auth middleware
        console.log('files inside document upload controller: ', req.files);
        const customFormData = JSON.parse(req.body.customFormData);
        console.log('customFormData inside document upload controller: ', customFormData);

        // Fetch the user's document limit
        const documentLimit = await UserModel.getDocumentLimit(profileId);

        // get user total uploaded documents
        const { total_documents } = await UserModel.getUserTotalDocsAndSignatures(profileId);

        // Check if the user has reached their document limit
        if (total_documents >= documentLimit) {
            return res.status(400).json({ error: 'Document limit reached. Cannot upload more documents.' });
        }

        const { title, description, category, publicFlag, hash, expiresAt = null } = customFormData;

        // Handle case for multiple files upload
        const blobDetailsList = req.files.map((file) => ({
            filename: file.originalname,
            contentType: file.mimetype,
            byteSize: file.size,
            checksum: hash,
            s3ObjectKey: file.key,
            s3ObjectUrl: file.location,
        }));

        console.log('blob details inside document upload controller: ', blobDetailsList);

        // Create a document entry for each file
        const documentIds = await Promise.all(
            blobDetailsList.map((blobDetails) =>
                DocumentModel.createDocumentWithBlob(
                    profileId,
                    { title, description, category, publicFlag, expiresAt },
                    blobDetails
                )
            )
        );

        res.status(201).json({
            message: 'Documents uploaded and details stored successfully',
            documentIds,
        });
    } catch (error) {
        console.error('Error in uploadDocumentAndStoreDetails:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const updateDocument = async (req, res) => {
    try {
        const document = await DocumentModel.updateDocument(req.params.documentId, req.body);
        res.json(document);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteUnsentPrivateDocument = async (req, res) => {
    const { documentId } = req.params;
    const userProfileId = req.user.profileId; // populated by authentication middleware

    try {
      const document = await DocumentModel.getAnyDocumentById(documentId);
      // if document being deleted was uploaded by authenticated user, document is not public, and document can still add access(aka not sent yet)
        if (document.user_profile_id === userProfileId && !document.public && document.can_add_access) {
            const success = await DocumentModel.deleteDocument(documentId, userProfileId);
            if (success) {
                return res.json({ message: 'Document successfully deleted.' });
            } else {
                return res.status(403).json({
                    message: 'Deletion failed. Document may not meet the necessary conditions or does not exist.',
                });
            }
        }
    } catch (error) {
        console.error('Error deleting document:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

const disableDocumentAccess = async (req, res) => {
    const userProfileId = req.user.profileId;
    const { documentId } = req.params;

    try {
        const success = await DocumentModel.disableDocumentAccess(documentId, userProfileId);
        if (success) {
            return res.json({ message: 'Document access has been successfully disabled.' });
        } else {
            return res
                .status(403)
                .json({ message: 'Failed to disable document access. You may not have the necessary permissions.' });
        }
    } catch (error) {
        console.error('Error disabling document access:', error);
        return res.status(500).json({ error: 'An error occurred while trying to disable document access.' });
    }
};

const getPrivateDocument = async (req, res) => {
    const documentId = req.params.documentId;

    // Ensure the requester is logged in
    if (!req.user || !req.user.profileId || !req.user.email) {
        return res.status(401).json({ message: 'Unauthorized: You must be logged in to access private documents.' });
    }

    try {
        const document = await DocumentModel.getAnyDocumentById(documentId);

        if (!document) {
            return res.status(404).send('Document not found.');
        }

        // If the document is public, return it immediately
        if (document.public) {
            const preSignedUrl = await returnSignedUrlFromS3BucketKey(document.s3_object_key);
            const { s3_object_key, s3_object_url, ...parsedDocument } = document;
            return res.json({ meta: parsedDocument, preSignedUrl });
        }

        // Check if the requester is the uploader of the document
        if (document.user_profile_id === req.user.profileId) {
            const preSignedUrl = await returnSignedUrlFromS3BucketKey(document.s3_object_key);
            const { s3_object_key, s3_object_url, ...parsedDocument } = document;
            return res.json({ meta: parsedDocument, preSignedUrl });
        }

        // If the document is private, check for access rights
        const documentAccessObjects = await DocumentAccessModel.getAccessObjectsByDocumentId(document.id);
        const hasAccess = documentAccessObjects.some(
            (object) => object.email === req.user.email || object.wallet_address === req.user.walletAddress
        );

        if (hasAccess) {
            const preSignedUrl = await returnSignedUrlFromS3BucketKey(document.s3_object_key);
            const { s3_object_key, s3_object_url, ...parsedDocument } = document;
            return res.json({ meta: parsedDocument, preSignedUrl });
        } else {
            return res.status(403).send('Access denied. You have not been given access to this document.');
        }
    } catch (err) {
        console.error('Error getting document:', err);
        res.status(500).send('Internal server error.');
    }
};


// excludes all public documents
const getPrivateDocumentsForUser = async (req, res) => {
    try {
        const userProfileId = req.user.profileId;
        const userEmail = req.user.email;

        if (!userProfileId || !userEmail) {
            return res.status(403).json({ message: 'User authentication required.' });
        }

        // Fetching documents using access controls, all uploaded by user or access controls given to authenticated email
        const documents = await DocumentAccessModel.getAllGivenAccessAndUploadedPrivateDocuments(
            userProfileId,
            userEmail
        );

      console.log(`all users documents for profile id - ${userProfileId}: `, documents)

        const documentsWithAccessObjects = await Promise.all(
            documents.map(async (document) => {
                const arrayOfAccessObjectsConnectedToDocument = await DocumentAccessModel.getAccessObjectsByDocumentId(
                    document.id
                );

                const { s3_object_key, s3_object_url, ...connectedBlob } =
                    await DocumentModel.getDocumentBlobByDocumentId(document.id);

                const uploaderEmail = await UserModel.getEmailByProfileId(document.user_profile_id);

                return {
                    ...document,
                    accessObjects: arrayOfAccessObjectsConnectedToDocument,
                    uploader_email: uploaderEmail,
                    blob: connectedBlob,
                };
            })
        );

        res.json({
            success: true,
            documents: documentsWithAccessObjects,
        });
    } catch (error) {
        console.error('Failed to get private documents for user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const getAllUploadedDocumentsByUser = async (req, res) => {
    try {
        const userProfileId = req.user.profileId;
        const documents = await DocumentModel.getAllUploadedDocuments(userProfileId);
        res.json(documents);
    } catch (error) {
        console.error('Failed to get uploaded documents:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


const getRecipientSignatureStatus = async (req, res) => {
    const { documentId } = req.params;

    // Check if the documentId parameter is provided
    if (!documentId) {
        return res.status(400).json({ message: 'Missing document id to query.' });
    }

    try {
        // if document is still being processed
        const document = await DocumentModel.getAnyDocumentById(documentId);
        if (!document.public && document.can_add_access) {
            return res.status(200).json({
                signatureStatus: 'standby',
            });
        }

        // Use the getDocumentSignatureStatus method from SignatureModel to fetch status
        const signatureStatus = await SignatureModel.getDocumentSignatureStatus(documentId);

        // Check if the signature status could not be found or retrieved
        if (!signatureStatus) {
            return res.status(404).json({ message: 'Document not found or no signatures exist.' });
        }

        // Return the signature status in the response
        return res.status(200).json({
            documentId: signatureStatus.document_id,
            totalRecipients: signatureStatus.total_recipients,
            totalSignatures: signatureStatus.total_signatures,
            signatureStatus: signatureStatus.signature_status,
        });
    } catch (error) {
        // Log the error and respond with a generic server error message
        console.error('Error occurred trying to lookup signature status for this document:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export {
    uploadDocumentAndStoreDetails,
    getPublicDocumentsByUserEmail,
    getPublicDocument,
    getPrivateDocument,
    updateDocument,
    disableDocumentAccess,
    getPrivateDocumentsForUser,
    getAllUploadedDocumentsByUser,
    deleteUnsentPrivateDocument,
};
