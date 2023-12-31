import axiosInstance from './axiosInstance';

export const fetchDocuments = () => axiosInstance.get('/api/documents/');

export const fetchDocument = (docId) => axiosInstance.get(`/api/documents/${docId}`);

export const createDocument = (formData) =>
    axiosInstance.post('/api/documents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });

export const updateDocument = (docId, formData) =>
    axiosInstance.put(`/api/documents/${docId}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
      },
    });

export const deleteDocument = (docId) => axiosInstance.delete(`/api/documents/${docId}`);

export const fetchSignedUrl = (docId) =>
    axiosInstance.get(`/api/documents/${docId}/signedurl`);

export const finalizeDocument = (docId) =>
    axiosInstance.post(`/api/documents/${docId}/finalize`, {});

export const getSummary = () => axiosInstance.get(`/api/summary`);
