import { Navigate } from 'react-router-dom';
import styles from './Web2VerifyAuthToken.module.css';
import React, { useEffect, useState } from 'react';

function Web2VerifyAuthToken({ authenticator }) {
    const [isAuthenticated, setIsAuthenticated] = authenticator;
    const [shouldRedirect, setShouldRedirect] = useState(false);


    const [loading, setLoading] = useState(true);
    const [response, setResponse] = useState(null);

    useEffect(() => {
        // Extract the token from the URL
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        console.log("token in authentication component: ", token);

        if (token) {
            // Make a POST request with the token in the body
            fetch('http://localhost:3001/api/user/verifyEmailAuthToken', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token }),
            })
                .then((res) => {
                    console.log("response: ", res);
                    if (res.status === 200) {
                        return res.json();
                    } else {
                        // Directly throw an error which will be caught by the catch block
                        return res.json().then(data => {
                            throw new Error(data.error || 'Failed to verify email auth token');
                        });
                    }
                })
                .then((data) => {
                    console.log("response data form tokenAuth API: ", data);
                    setResponse(data.message);
                    setLoading(false);

                    if (data.userAuthenticated) {
                        setTimeout(() => setIsAuthenticated(true), 2000);
                    } else {
                        setShouldRedirect(true);
                        // You should handle the navigation outside of the fetch chain.
                        // For example, you could set a state variable here that triggers a redirect in the render function.
                    }
                })
                .catch((error) => {
                    console.log("Error: ", error);
                    setResponse(error.message);
                    setLoading(false);
                });

        } else {
            setResponse('No token found in the URL');
            setLoading(false);
        }
    }, []);

    // if (shouldRedirect) {
    //     return <Navigate to="/" replace />;
    // }
    console.log("shouldNavigate? : ", shouldRedirect)
    return shouldRedirect ? (
        <Navigate to="/" replace />
    ) : (
        <div>
            {loading ? (
                <div className={styles.loaderDiv}>
                    <h3>Authenticating e-mail...</h3>
                    <div className={styles.spinner}></div>
                </div>
            ) : (
                <div>{response}</div>
            )}
        </div>
    );

}

export default Web2VerifyAuthToken;
