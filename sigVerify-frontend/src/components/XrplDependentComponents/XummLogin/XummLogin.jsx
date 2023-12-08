import React, { useEffect } from 'react';
import './XummLogin.css';
import { useContext, useState } from 'react';
import { AccountContext } from '../../../App';
// import { useNavigate } from 'react-router-dom';

// needs updating - currently taken out of application temporarily

export default function XummLogin({ setWalletAuthOpened }) {
    const [accountObject, setAccountObject] = useContext(AccountContext);
    const [payloadCreate, setPayloadCreate] = useState({});
    const [payloadMessage, setPayloadMessage] = useState('Scan & sign with XUMM!');

    // const navigate = useNavigate();
    console.log('AccountContext: ', accountObject);

    useEffect(() => {
        if (accountObject.loggedIn) {
            console.log('login component- we are logged in.');
        }
    }, []);

    const authenticateXumm = async () => {
        // RETURN xumm sign-in payload object to display to client for signature
        await fetch('http://localhost:3001/api/xrpl/createXummSigninPayload', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then((response) => response.json())
            .then((signInPayload) => {
                console.log(signInPayload);
                setPayloadCreate(signInPayload);

                // After receiving the sign-in payload object, make a second request to listen to payload uuid for signature / reject
                return fetch('http://localhost:3001/api/xrpl/subscribeToPayload', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ payloadUuid: signInPayload.uuid }),
                });
            })
            .then((response) => response.json())
            .then((finalSignInPayloadReturnObject) => {
                console.log('resolved payload data: ', finalSignInPayloadReturnObject);

                if (finalSignInPayloadReturnObject.loggedIn) {
                    console.log('user successfully signed sign-in payload.');

                    //use fetch api to send put request to update users wallet address in db
                    fetch('http://localhost:3001/api/user/updateWalletAddress', {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            userId: accountObject.id,
                            newWalletAddress: finalSignInPayloadReturnObject.verifiedXrplWalletAddress,
                        }),
                    })
                        .then((response) => response.json())
                        .then((updateResponse) => {
                            console.log('Update response:', updateResponse);
                            // Handle the response from the update API
                            // Update local state, UI, etc., as needed
                        })
                        .catch((error) => {
                            console.error('Error updating wallet address:', error);
                        });

                    setAccountObject({
                        ...accountObject,
                        verifiedXrplWalletAddress: finalSignInPayloadReturnObject.verifiedXrplWalletAddress,
                        ...finalSignInPayloadReturnObject,
                    });

                    setPayloadMessage('Congratulations! You are now logged in.');
                    setPayloadCreate({});
                    // navigate('/profile');
                } else {
                    console.log('User Failed to sign in.');
                    setPayloadCreate({});
                    setPayloadMessage(
                        "Account 'sign-in' QR was rejected. Please reload web-page or click 'Genereate QR' again. Cannot proceed to 'Profile' without signing from XUMM wallet."
                    );
                }
            })
            .catch((error) => {
                console.error('Error during the authentication process:', error);
            });
    };

    return (
        <div className="loginComponent">
            <button
                onClick={() => {
                    setWalletAuthOpened(false);
                }}
            >
                Close
            </button>
            <h1>Connect</h1>
            {Object.keys(payloadCreate).length === 0 ? null : (
                <div className="payloadDiv">
                    <a href={payloadCreate?.qrLink} target="_blank">
                        <img src={payloadCreate?.qrImage} />
                    </a>
                </div>
            )}
            <p id="signInMsg">{payloadMessage}</p>
            <button className="buttonPop" onClick={authenticateXumm}>
                Generate QR
            </button>
        </div>
    );
}
