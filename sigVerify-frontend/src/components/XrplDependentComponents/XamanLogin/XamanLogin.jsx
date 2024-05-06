import { useEffect } from 'react';
import './XamanLogin.css';
import { useContext, useState } from 'react';
import { AccountContext } from '../../../App';
import { getSignInPayload, subscribeToPayload, updateUserWalletAddress } from '../../../utils/httpRequests/routes/xrpl';

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
        try {
            const signInPayload = await getSignInPayload();
            console.log(signInPayload);
            setPayloadCreate(signInPayload);

            const finalSignInPayloadReturnObject = await subscribeToPayload(signInPayload.uuid);
            console.log('finalized payload data: ', finalSignInPayloadReturnObject);

            if (finalSignInPayloadReturnObject.signed) {
                console.log('user successfully signed sign-in payload.');

                const updateResponse = await updateUserWalletAddress(finalSignInPayloadReturnObject.signer);
                console.log('Update response:', updateResponse);
                console.log('HELOOOOOOOOO I AM UPDATING THE NEW WALLETTTTTTTT');
                setPayloadMessage('Congratulations! You are now logged in.');
                setPayloadCreate({});
                setAccountObject({
                    ...accountObject,
                    wallet_address: finalSignInPayloadReturnObject.signer,
                });
                setWalletAuthOpened(false);
            } else {
                console.log('User Failed to sign in.');
                setPayloadCreate({});
                setPayloadMessage(
                    "Account 'sign-in' QR was rejected. Please reload web-page or click 'Genereate QR' again. Cannot proceed to 'Profile' without signing from Xaman wallet."
                );
            }
        } catch (error) {
            console.error('Error during the authentication process:', error);
        }
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
