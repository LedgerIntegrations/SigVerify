import axiosInstance from '../axiosInstance';

export const fetchUserPublicKeyAndWallet = (email) =>
    axiosInstance.post('/api/user/publicKeyAndWallet', {
        email: email,
    });