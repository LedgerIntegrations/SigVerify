import axios from 'axios';
// import { AccountContext } from '../App';

const serverUrl = 'http://localhost:3001';
const axiosInstance = axios.create({
    withCredentials: true,
    baseURL: serverUrl,
});

// Response interceptor
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          // Modify the error and reject the promise

            return Promise.reject({ ...error, isAuthError: true });
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
