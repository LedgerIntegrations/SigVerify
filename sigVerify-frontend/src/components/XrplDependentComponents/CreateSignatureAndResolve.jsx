import { useEffect } from 'react';
import './XummLogin/XummLogin.css';
import { useContext, useState } from 'react';
import { AccountContext } from '../../App';
// import { useNavigate } from 'react-router-dom';

import {
    generateSignEncryptedJsonDataPayloadAxiosRequest,
    subscribeToXrplPayloadAxiosRequest,
} from '../../utils/httpRequests/routes/xrpl';

// eslint-disable-next-line react/prop-types
export default function CreateSignatureAndResolve({
    setWalletAuthOpened,
    encryptedJsonData,
    setDocumentSignatureStatus,
}) {
    const [accountObject, setAccountObject] = useContext(AccountContext);
    const [payloadCreate, setPayloadCreate] = useState({});
    const [payloadMessage, setPayloadMessage] = useState('Scan & sign with XUMM!');
    const [isButtonClicked, setIsButtonClicked] = useState(false);
    // const navigate = useNavigate();
    console.log('AccountContext: ', accountObject);

    useEffect(() => {
        // Reset button click state when the component is opened
        setIsButtonClicked(false);
    }, [setWalletAuthOpened]);

    const authenticateXumm = async () => {
        setIsButtonClicked(true);
        // RETURN xumm sign-in payload object to display to client for signature
        try {
            const response = await generateSignEncryptedJsonDataPayloadAxiosRequest(
                accountObject.xrplWalletAddress,
                encryptedJsonData
            );

            console.log('axios response: ', response);

            const jsonPayloadResponseForSigningEncryptedData = response.data;
            console.log(jsonPayloadResponseForSigningEncryptedData);
            setPayloadCreate(jsonPayloadResponseForSigningEncryptedData);

            // After receiving the sign-in payload object, make a second request to listen to payload uuid for signature / reject
            const subscribeResponse = await subscribeToXrplPayloadAxiosRequest({
                payloadUuid: jsonPayloadResponseForSigningEncryptedData.uuid,
            });
            const finalencryptedJsonSignaturePayloadReturnObject = subscribeResponse.data;
            console.log('resolved payload data: ', finalencryptedJsonSignaturePayloadReturnObject);
            // checking if payload resolve signed property is true
            if (finalencryptedJsonSignaturePayloadReturnObject.signed) {
                console.log('user successfully signed payload.');
                setPayloadMessage('Document has been successfully signed!');
                setDocumentSignatureStatus({
                    signed: true,
                    resolveData: finalencryptedJsonSignaturePayloadReturnObject,
                });

                setPayloadCreate({});
                setWalletAuthOpened(false);
                // navigate('/profile');
            } else {
                console.log('User Failed to sign encrypted form data via xrpl tx.');
                setPayloadCreate({});
                setPayloadMessage(
                    "Sign Document payload was rejected. Please reload web-page or close modal and click 'Sign & Submit' again to retry."
                );
            }
        } catch (error) {
            console.error('Error during the form data signature process:', error);
        }
    };

    return (
        <div className="loginComponent" style={{ bottom: '-500px' }}>
            <button
                id="closeModalButton"
                className="buttonPop"
                onClick={() => {
                    setWalletAuthOpened(false);
                }}
            >
                Close
            </button>
            <h1>Sign Document</h1>
            {Object.keys(payloadCreate).length === 0 ? null : (
                <div className="payloadDiv">
                    <a href={payloadCreate?.qrLink} target="_blank" rel="noreferrer">
                        <img src={payloadCreate?.qrImage} />
                    </a>
                </div>
            )}
            <p id="signInMsg">{payloadMessage}</p>
            {!isButtonClicked && (
                <button className="buttonPop" id="generateQr" onClick={authenticateXumm}>
                    Generate Signature QR
                </button>
            )}
        </div>
    );
}
