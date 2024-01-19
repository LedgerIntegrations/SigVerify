import axiosInstance from '../axiosInstance';

export const fetchDocuments = () => axiosInstance.get('/api/documents/');

export const fetchDocument = (docId) => axiosInstance.get(`/api/documents/${docId}`);

export const uploadDocument = async (formData) => {
    try {
        const response = await axiosInstance.post('/api/document/upload', formData, {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (response.status === 200) {
            return response.data;
        } else {
            throw new Error('Failed to upload document');
        }
    } catch (error) {
        console.error('Error during document upload:', error);
        throw error; // Re-throw the error for the caller to handle
    }
};

// export const updateDocument = (docId, formData) =>
//     axiosInstance.put(`/api/documents/${docId}`, formData, {
//         headers: {
//             'Content-Type': 'multipart/form-data',
//       },
//     });

// export const deleteDocument = (docId) => axiosInstance.delete(`/api/documents/${docId}`);

// export const fetchSignedUrl = (docId) =>
//     axiosInstance.get(`/api/documents/${docId}/signedurl`);

// export const finalizeDocument = (docId) =>
//     axiosInstance.post(`/api/documents/${docId}/finalize`, {});

// export const getSummary = () => axiosInstance.get(`/api/summary`);
