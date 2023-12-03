import React, { useEffect } from 'react';
import './XummLogin.css';
import { useContext, useState } from 'react';
import { AccountContext } from '../../../App';
// import { useNavigate } from 'react-router-dom';

// needs updating - currently taken out of application temporarily

export default function XummLogin({ setWalletAuthOpened }) {
  const [accountObject, setAccountObject] =
    useContext(AccountContext);
  const [payloadCreate, setPayloadCreate] = useState({});
  const [payloadMessage, setPayloadMessage] = useState(
    'Scan & sign with XUMM!'
  );

  // const navigate = useNavigate();
  console.log('AccountContext: ', accountObject);

  useEffect(() => {
    if (accountObject.loggedIn) {
      console.log('login component- we are logged in.');
    }
  }, []);

  const authenticateXumm = async () => {
    // const signInEndpoint = '/api/signIn';
    // const subscribeToSignInEndpoint = '/api/subscribeToSignIn';

    // First request to get signIn payload
    await fetch(
      'http://localhost:3001/api/xrpl/createXummSigninPayload',
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
      .then((response) => response.json())
      .then((signInPayload) => {
        console.log(signInPayload);
        setPayloadCreate(signInPayload);

        // After receiving the first response, make a second request to subscribeToSignIn
        return fetch(
          'http://localhost:3001/api/xrpl/subscribeToPayload',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ payloadUuid: signInPayload.uuid }),
          }
        );
      })
      .then((response) => response.json())
      .then((finalSignInPayloadReturnObject) => {
        console.log(
          'resolved payload data: ',
          finalSignInPayloadReturnObject
        );

        if (finalSignInPayloadReturnObject.loggedIn) {
          console.log('user successfully signed in.');
          setAccountObject({
            ...accountObject,
            verifiedXrplWalletAddress: finalSignInPayloadReturnObject.verifiedXrplWalletAddress,
            ...finalSignInPayloadReturnObject ,
          });
          setPayloadMessage(
            'Congratulations! You are now logged in.'
          );
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
        console.error(
          'Error during the authentication process:',
          error
        );
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
