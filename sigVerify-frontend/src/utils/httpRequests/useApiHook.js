// src/hooks/useApi.js
import { useContext } from 'react';
import { AccountContext } from '../context/AccountContext';
import axiosInstance from './axiosInstance';
import { useNavigate } from 'react-router-dom';

//! UNDER DEVELOPMENT

const useApiHook = () => {
    const navigate = useNavigate();
    const [accountObject, setAccountObject] = useContext(AccountContext);

    const sendRequest = async (config) => {
        try {
            const response = await axiosInstance(config);
            return response;
        } catch (error) {
            if (error.isAuthError) {
                // Handle authentication error
                // Example: Resetting account context or redirecting
              setAccountObject({ loggedIn: false });
              navigate('/login-user');

                // Additional actions like redirecting can be handled here
            }
            throw error;
        }
    };

    return sendRequest;
};

export default useApiHook;
