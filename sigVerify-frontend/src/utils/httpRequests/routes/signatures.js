// /utils/httpRequests/routes/signatures.js
import axiosInstance from '../axiosInstance';

// * UNPROTECTED
export const findAllAccountPaymentTransactions = (rAddress) => {
    return axiosInstance.post('/api/user/findAllAccountPaymentTransactionsToSigVerifyWallet', { rAddress });
};

export const getDocumentSignatures = (documentId) => axiosInstance.get(`/api/signatures/document/${documentId}`);

// get signature objects for an array of signature Ids
export const fetchSignatureDetails = (signatureId) => axiosInstance.get(`/api/signature/${signatureId}`)

// * PROTECTED
// export const getSignaturesForPrivateDoc = (documentId) => axiosInstance.get(`/api/signatures/private/document/${documentId}`);
export const getAllUserSignatures = () => axiosInstance.get('/api/signatures/user');
export const getSignaturesStatusForDoc = (documentId) => axiosInstance.get(`/api/signatures/status/document/${documentId}`);
export const postResolvedSignature = async (resolvedPayload) => {
    const { documentId, xrplTxHash, signerWalletAddress, documentChecksum } = resolvedPayload;

    try {
        // Attempt to send a POST request to the server
        const response = await axiosInstance.post('/api/signature', {
            documentId,
            xrplTxHash,
            signerWalletAddress,
            documentChecksum,
        });
        // Return a success response object
        return { success: true, data: response.data };
    } catch (error) {
        console.error('Error posting signature:', error);

        // Check for response error specifics and modify error handling accordingly
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            return {
                success: false,
                message: error.response.data.message || 'Error occurred while posting signature.',
                status: error.response.status,
            };
        } else if (error.request) {
            // The request was made but no response was received
            return { success: false, message: 'No response from server.', status: null };
        } else {
            // Something happened in setting up the request that triggered an Error
            return { success: false, message: error.message, status: null };
        }
    }
};
