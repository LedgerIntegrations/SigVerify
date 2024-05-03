// /utils/httpRequests/axiosInstance.js
import axios from 'axios';

//will always be production if running from built dist folder with vite defaults
console.log("axios instance environment check: ", process.env.NODE_ENV);

const serverUrl = process.env.NODE_ENV === 'production' ? 'https://sigverify.com' : 'http://localhost:3001';

console.log("SERVER URL: ", serverUrl);

const axiosInstance = axios.create({
    withCredentials: true,
    baseURL: serverUrl,
});

axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            return Promise.reject({ ...error, isAuthError: true });
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;