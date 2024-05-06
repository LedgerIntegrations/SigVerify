// /utils/httpRequests/routes/documents.js

import axiosInstance from '../axiosInstance';

// * PUBLIC
export const fetchPublicDocument = (docId) => axiosInstance.get(`/api/document/public/${docId}`);
export const fetchUserPublicDocumentsByEmail = (userEmail) => axiosInstance.get(`/api/documents/public/email/${userEmail}`);

// * PRIVATE
export const fetchPrivateDocument = (documentId) => axiosInstance.get(`/api/document/private/${documentId}`);
export const fetchUserPrivateDocuments = () => axiosInstance.get('/api/documents/private/user');
export const fetchUserUploadedDocuments = () => axiosInstance.get('/api/documents/uploaded/user');

export const uploadDocument = async (formData) => {
    try {
        // Remove the Content-Type header to let the browser set it automatically
        const response = await axiosInstance.post('/api/document', formData);
        if (response.status === 201) {
            return response.data;
        } else {
            throw new Error('Failed to upload document');
        }
    } catch (error) {
        console.error('Error during document upload:', error);
        throw error; // Re-throw the error for the caller to handle
    }
};

export const deletePrivateUnsentDocument = (documentId) => axiosInstance.delete(`/api/document/delete/unsent/${documentId}`)

//! DOCUMENT ACCESS
// * PUBLIC

// * PRIVATE
export const fetchAccessObjectsForDocument = (documentId) => axiosInstance.get(`/api/document/access/${documentId}`);
export const fetchAllDocumentsUserHasAccessTo = () => axiosInstance.get('/api/documents/access/user');
export const fetchAllDocumentsUserUploadedAndWasGivenAccess = () => axiosInstance.get('/api/documents/access/all')

export const addDocumentAccess = async (documentId, email = null, walletAddress = null) => {
    try {
        const payload = {
            documentId,
            email,
            walletAddress,
        };

        const response = await axiosInstance.post('/api/document/access', payload, {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        console.log('Access successfully added or updated:', response.data);

        return response.data;
    } catch (err) {
        console.error('Error creating new document access:', err.response ? err.response.data : err);
        throw err; // Rethrow the error if you need calling code to handle it
    }
};

export const disableDocumentAccess = async (documentId) => {
    try {
        const response = await axiosInstance.put(`/api/document/access/disable/${documentId}`);
        if (response.status === 200) {
            console.log('Document access disabled successfully:', response.data);
            return response.data;
        } else {
            throw new Error('Failed to disable document access');
        }
    } catch (error) {
        console.error('Error disabling document access:', error.response ? error.response.data : error);
        throw error; // Re-throw the error for the caller to handle
    }
};

export const deleteDocumentAccessEntry = async (accessId) => {
    try {
        const response = await axiosInstance.delete(`/api/document/access/${accessId}`);
        if (response.status === 200) {
            console.log('Document access entry deleted successfully:', response.data);
            return response.data;
        } else {
            throw new Error('Failed to delete document access entry');
        }
    } catch (error) {
        console.error('Error deleting document access entry:', error.response ? error.response.data : error);
        throw error; // Re-throw the error for the caller to handle
    }
};
