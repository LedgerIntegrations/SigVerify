import { useEffect } from 'react';
import './XamanLogin/XamanLogin.css';
import { useContext, useState } from 'react';
import { AccountContext } from '../../App';
import styled from 'styled-components';
import { createMemoPaymentTxPayloadRequest, subscribeToXrplPayloadRequest } from '../../utils/httpRequests/routes/xrpl';

const CreateSignatureContainer = styled.div`
    min-height: fit-content;
    width: 70vw;
    max-width: 320px;
    min-width: 250px;
    display: flex;
    position: absolute;
    background-color: white;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 1.5rem;
    padding-top: 15px;
    border-radius: 24px;
    margin-block: 5vh;
    box-shadow: 0px 10px 18px 0px #242a49cb;
    font-size: 0.8em;
    z-index: 60;
    left: 50%;
    transform: translateX(-50%);
    top: 250px;

    h1 {
        margin-top: 0px;
        color: black;
        -webkit-text-stroke: 1px white;
        margin-bottom: 0px;
        font-family: 'Rajdhani', sans-serif;
        font-size: 2rem;
    }

    button {
        border: 1px solid gray;
        margin-top: 1vh;
        padding: 5px 20px;
        border-radius: 20px;
        z-index: 65;
    }

    @media (min-width: 440px) {
        max-width: 300px;
    }
`;

const CloseModalButton = styled.button`
    margin-bottom: 20px;
    margin-top: 0px;
    transform: translateX(100%);
    background-color: rgb(64, 99, 224);
    color: white;
    border: none;
    z-index: 1010;
`;

const QrDiv = styled.div`
    color: white;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    img {
        margin-top: 1.5vh;
        height: 130px;
        width: 130px;

        @media (min-width: 640px) {
            width: 120px;
            height: 120px;
        }
    }

    a {
        font-size: 0.75rem;
        max-width: 60vw;
        padding: 0.7rem;
        color: white;
    }
`;

const GenerateQrButton = styled.button`
    background-color: rgb(64, 99, 224);
    color: white;
    margin-top: 0px;
    margin-bottom: 20px;
    border: none;
`;
// eslint-disable-next-line react/prop-types
export default function CreateSignatureAndResolve({ onClose, memoData, setSignatureStatus }) {
    const [accountObject, setAccountObject] = useContext(AccountContext);
    const [payloadDataState, setPayloadDataState] = useState({});
    const [payloadMessage, setPayloadMessage] = useState('Scan & sign with Xaman!');
    const [isButtonClicked, setIsButtonClicked] = useState(false);
    // const navigate = useNavigate();
    console.log('AccountContext: ', accountObject);

    useEffect(() => {
        console.log('use effect inside create and resolve signature modal.');
    }, []);

    const authenticateXaman = async () => {
        setIsButtonClicked(true);
        // RETURN Xaman sign-in payload object to display to client for signature
        try {
            const response = await createMemoPaymentTxPayloadRequest(accountObject.xrplWalletAddress, memoData);

            console.log('axios response: ', response);

            const createdPayloadData = response.data;
            console.log(createdPayloadData);
            setPayloadDataState(createdPayloadData);

            // After receiving the sign-in payload object, make a second request to listen to payload uuid for signature / reject
            const subscribeResponse = await subscribeToXrplPayloadRequest({
                payloadUuid: createdPayloadData.uuid,
            });
            const payloadSubscribeResponseData = subscribeResponse.data;
            console.log('resolved payload data: ', payloadSubscribeResponseData);
            // checking if payload resolve signed property is true
            if (payloadSubscribeResponseData.signed) {
                console.log('user successfully signed payload.');
                setPayloadMessage('Document has been successfully signed!');
                setSignatureStatus({
                    signed: true,
                    resolveData: payloadSubscribeResponseData,
                });

                setPayloadDataState({});
                onCLose();
            } else {
                console.log('User Failed to sign encrypted form data via xrpl tx.');
                setPayloadDataState({});
                setPayloadMessage(
                    "Sign Document payload was rejected. Please reload web-page or close modal and click 'Sign & Submit' again to retry."
                );
            }
        } catch (error) {
            console.error('Error during the form data signature process:', error);
        }
    };

    return (
        <CreateSignatureContainer>
            <CloseModalButton id="closeModalButton" className="buttonPop" onClick={onClose}>
                Close
            </CloseModalButton>
            <h1>Sign Document</h1>
            {Object.keys(payloadDataState).length === 0 ? null : (
                <QrDiv>
                    <a href={payloadDataState?.qrLink} target="_blank" rel="noreferrer">
                        <img src={payloadDataState?.qrImage} />
                    </a>
                </QrDiv>
            )}
            <p id="signInMsg">{payloadMessage}</p>
            {!isButtonClicked && (
                <GenerateQrButton className="buttonPop" onClick={authenticateXaman}>
                    Generate Signature QR
                </GenerateQrButton>
            )}
        </CreateSignatureContainer>
    );
}
