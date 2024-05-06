// /sigVerify-backend/controllers/DocumentAccessController.js
import DocumentAccessModel from '../models/DocumentAccess.js';

const addOrUpdateAccessToDocument = async (req, res) => {
    const uploaderId = req.user.profileId;
    const { documentId, email, walletAddress } = req.body;

    try {
        const accessRecord = await DocumentAccessModel.addOrUpdateAccessToDocument(uploaderId, {
            documentId,
            email,
            walletAddress,
        });
        res.json({ message: 'Access successfully added or updated', accessRecord });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteDocumentAccessEntry = async (req, res) => {
    const requestingUserId = req.user.profileId;
    const { accessId } = req.params;

    try {
        const deleteSuccessful = await DocumentAccessModel.deleteAccessById(accessId, requestingUserId);

        if (deleteSuccessful) {
            res.json({ message: 'Document access record deleted successfully.' });
        } else {
            res.status(404).json({ message: 'Document access record not found or failed to delete.' });
        }
    } catch (error) {
        console.error('Error deleting document access entry:', error);
        res.status(500).json({ error: error.message });
    }
};

const getAccessObjectsByDocumentId = async (req, res) => {
    const { documentId } = req.params;

    try {
        const accessDetails = await DocumentAccessModel.getAccessObjectsByDocumentId(documentId);
        res.json(accessDetails);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getAllDocumentsUserWasGivenAccessTo = async (req, res) => {
    const userProfileId = req.user.profileId;

    try {
        const documents = await DocumentAccessModel.getAllDocumentsUserWasGivenAccessTo(userProfileId);
        res.json(documents);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getAllGivenAccessAndUploadedDocuments = async (req, res) => {
    const userProfileId = req.user.profileId;

    try {
        const documents = await DocumentAccessModel.getAllGivenAccessAndUploadedDocuments(userProfileId);
        res.json(documents);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export {
    addOrUpdateAccessToDocument,
    deleteDocumentAccessEntry,
    getAccessObjectsByDocumentId,
    getAllDocumentsUserWasGivenAccessTo,
    getAllGivenAccessAndUploadedDocuments,
};
