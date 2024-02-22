import axios from 'axios';

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

// utils/httpRequests/axiosInstance.js

// import axios from 'axios';
// import kickUnauthenticatedUser from './kickUnauthenticatedUser';
// const serverUrl = 'http://localhost:3001';


// // Function to initialize Axios instance with interceptor
// const createAxiosInstance = (setAccountObject) => {
//     const axiosInstance = axios.create({
//         withCredentials: true,
//         baseURL: serverUrl,
//     });

//     axiosInstance.interceptors.response.use(
//         (response) => response,
//         async (error) => {
//             if (error.response && (error.response.status === 401 || error.response.status === 403)) {
//                 // Call kickUnauthenticatedUser
//                 await kickUnauthenticatedUser(setAccountObject);

//                 return Promise.reject({ ...error, isAuthError: true });
//             }
//             return Promise.reject(error);
//         }
//     );

//     return axiosInstance;
// };

// export default createAxiosInstance;
