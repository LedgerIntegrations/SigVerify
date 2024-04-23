// /utils/httpRequests/routes/users.js

import axiosInstance from '../axiosInstance';

export const getUserEmail = () => axiosInstance.get('/api/user/email');
export const getProfileData = () => axiosInstance.get('/api/user/profileData');

export const fetchUserPublicKeyAndWalletByHashedEmail = (email) =>
    axiosInstance.post('/api/user/publicKeyAndWallet', {
        email: email,
    });
export const removeUserAuthTokenCookie = () => axiosInstance.get('/api/user/logout');
export const deleteUserXrplWallet = () => axiosInstance.delete('/api/user/wallet');