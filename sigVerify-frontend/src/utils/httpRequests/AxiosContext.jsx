import { createContext, useContext } from 'react';
import createAxiosInstance from './axiosInstance';

// Create context
const AxiosContext = createContext();

// Export the useAxios hook for easy use in components
export const useAxios = () => useContext(AxiosContext);

// Provider Component
// eslint-disable-next-line react/prop-types
export const AxiosProvider = ({ setAccountObject, children }) => {
    const axiosInstance = createAxiosInstance(setAccountObject);

    return <AxiosContext.Provider value={axiosInstance}>{children}</AxiosContext.Provider>;
};