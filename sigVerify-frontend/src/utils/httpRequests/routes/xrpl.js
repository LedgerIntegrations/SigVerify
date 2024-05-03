// /utils/httpRequests/routes/xrpl.js

import axiosInstance from '../axiosInstance';

export const createMemoPaymentTxPayloadRequest = (rAddress, memoData) =>
    axiosInstance.post('/api/xrpl/create/memoPaymentTxPayload', {
        userRAddress: rAddress,
        memoData,
    });

export const subscribeToXrplPayloadRequest = (uuid) => axiosInstance.post('/api/xrpl/subscribeToPayload', uuid);

// Function to get the sign-in payload
export const getSignInPayload = async () => {
    try {
        const response = await axiosInstance.get('/api/xrpl/payload/create/signin');
        return response.data;
    } catch (error) {
        console.error('Error fetching sign-in payload:', error);
        throw error;
    }
};

// Function to subscribe to payload UUID for signature / reject
export const subscribeToPayload = async (payloadUuid) => {
    try {
        const response = await axiosInstance.post('/api/xrpl/payload/subscribe', {
            payloadUuid
        });
        return response.data;
    } catch (error) {
        console.error('Error subscribing to payload:', error);
        throw error;
    }
};

// Function to update user's wallet address
export const updateUserWalletAddress = async (newWalletAddress) => {
    try {
        const response = await axiosInstance.put('/api/user/wallet', {
            newWalletAddress
        });
        return response.data;
    } catch (error) {
        console.error('Error updating wallet address:', error);
        throw error;
    }
};