import axiosInstance from '../axiosInstance';

export const generateSignEncryptedJsonDataPayloadAxiosRequest = (rAddress, encryptedJsonData) =>
    axiosInstance.post('/api/xrpl/signEncryptedJsonData', {
        userRAddress: rAddress,
        encryptedJsonData,
    });

export const subscribeToXrplPayloadAxiosRequest = (uuid) =>
    axiosInstance.post('/api/xrpl/subscribeToPayload', uuid);