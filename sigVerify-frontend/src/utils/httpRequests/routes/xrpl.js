// /utils/httpRequests/routes/xrpl.js

import axiosInstance from '../axiosInstance';

export const createMemoPaymentTxPayloadRequest = (rAddress, memoData) =>
    axiosInstance.post('/api/xrpl/create/memoPaymentTxPayload', {
        userRAddress: rAddress,
        memoData,
    });

export const subscribeToXrplPayloadRequest = (uuid) => axiosInstance.post('/api/xrpl/subscribeToPayload', uuid);
