import axiosInstance from '../axiosInstance';

export const fetchUserPublicKeyAndWalletByHashedEmail = (email) =>
    axiosInstance.post('/api/user/publicKeyAndWallet', {
        email: email,
    });

export const removeUserAuthTokenCookie = () => axiosInstance.get('/api/user/logout');