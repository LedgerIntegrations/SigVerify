import { useEffect } from 'react';
import './XamanLogin.css';
import { useContext, useState } from 'react';
import { AccountContext } from '../../../App';
// import { useNavigate } from 'react-router-dom';

// needs updating - currently taken out of application temporarily

// eslint-disable-next-line react/prop-types
export default function XamanLogin({ setWalletAuthOpened }) {
    const [accountObject, setAccountObject] = useContext(AccountContext);
    const [payloadCreate, setPayloadCreate] = useState({});
    const [payloadMessage, setPayloadMessage] = useState('Scan & sign with Xaman!');

    // const navigate = useNavigate();
    console.log('AccountContext: ', accountObject);

    useEffect(() => {
        // if (accountObject.loggedIn) {
        //     console.log('login component- we are logged in.');
        // }
        authenticateXaman();
    }, []);

    const authenticateXaman = async () => {
        // RETURN Xaman sign-in payload object to display to client for signature
        await fetch('http://localhost:3001/api/xrpl/payload/create/signin', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include', // This is necessary to include cookies
        })
            .then((response) => response.json())
            .then((signInPayload) => {
                console.log(signInPayload);
                setPayloadCreate(signInPayload);

                // After receiving the sign-in payload object, make a second request to listen to payload uuid for signature / reject
                return fetch('http://localhost:3001/api/xrpl/payload/subscribe', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include', // This is necessary to include cookies
                    body: JSON.stringify({ payloadUuid: signInPayload.uuid }),
                });
            })
            .then((response) => response.json())
            .then((finalSignInPayloadReturnObject) => {
                console.log('finalized payload data: ', finalSignInPayloadReturnObject);

                if (finalSignInPayloadReturnObject.signed) {
                    console.log('user successfully signed sign-in payload.');

                    //use fetch api to send put request to update users wallet address in db
                    fetch('http://localhost:3001/api/user/wallet', {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        credentials: 'include', // This is necessary to include cookies
                        body: JSON.stringify({
                            newWalletAddress: finalSignInPayloadReturnObject.signer,
                        }),
                    })
                        .then((response) => response.json())
                        .then((updateResponse) => {
                            console.log('Update response:', updateResponse);
                            console.log('HELOOOOOOOOO I AM UPDATING THE NEW WALLETTTTTTTTTT');
                            setPayloadMessage('Congratulations! You are now logged in.');
                            setPayloadCreate({});
                            setAccountObject({
                                ...accountObject,
                                wallet_address: finalSignInPayloadReturnObject.signer,
                            });
                            setWalletAuthOpened(false);
                        })
                        .catch((error) => {
                            console.error('Error adding/updating wallet address:', error);
                        });

                    // setAccountObject({
                    //     ...accountObject,
                    //     xrplWalletAddress: finalSignInPayloadReturnObject.signer,
                    //     loggedIn: finalSignInPayloadReturnObject.signed,
                    // });

                    // navigate('/profile');
                } else {
                    console.log('User Failed to sign in.');
                    setPayloadCreate({});
                    setPayloadMessage(
                        "Account 'sign-in' QR was rejected. Please reload web-page or click 'Genereate QR' again. Cannot proceed to 'Profile' without signing from Xaman wallet."
                    );
                }
            })
            .catch((error) => {
                console.error('Error during the authentication process:', error);
            });
    };

    return (
        <div className="loginComponent">
            {Object.keys(payloadCreate).length === 0 ? null : (
                <div className="payloadDiv">
                    <a href={payloadCreate?.qrLink} target="_blank" rel="noreferrer">
                        <img src={payloadCreate?.qrImage} />
                    </a>
                </div>
            )}
            <p id="signInMsg">{payloadMessage}</p>
        </div>
    );
}
