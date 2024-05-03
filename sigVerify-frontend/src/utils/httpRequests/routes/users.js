// /utils/httpRequests/routes/users.js

import axiosInstance from '../axiosInstance';

export const registerUser = (email) => {
    return axiosInstance.post('/api/user/register', { email });
};

export const createUser = (payload) => {
    return axiosInstance.post('/api/user/create', payload);
};

export const loginUser = (payload) => {
    return axiosInstance.post('/api/user/login', payload);
};

export const getUserEmail = () => axiosInstance.get('/api/user/email');
export const getProfileData = () => axiosInstance.get('/api/user/profileData');

export const fetchUserPublicKeyAndWalletByHashedEmail = (email) =>
    axiosInstance.post('/api/user/publicKeyAndWallet', {
        email: email,
    });
export const removeUserAuthTokenCookie = () => axiosInstance.get('/api/user/logout');
export const deleteUserXrplWallet = () => axiosInstance.delete('/api/user/wallet');

// // converts (1) email to array of wallets [wallet] (2) wallet to a email string
// // input string should be "initialValueType(email || wallet):value" Example: (1) `email:myemail@gmail.com` OR (2) `wallet:rind8sjndnfkdjDNKf73KJF`
// // sending email should return list of wallets linked to that email, sending wallet should return email linked to that wallet
// export const walletToOrFromEmail = (stringToResolve) => axiosInstance.get(`/api/WER/${stringToResolve}`)

// export const attachWalletToEmail = () => axiosInstance.post('/api/wallet/connect')
