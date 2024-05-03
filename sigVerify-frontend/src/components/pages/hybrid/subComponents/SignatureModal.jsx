import { useState, useContext, useEffect } from 'react';
import { AccountContext } from '../../../../App';
import styled from 'styled-components';
import axiosInstance from '../../../../utils/httpRequests/axiosInstance';
import { useNavigate } from 'react-router-dom';
import CustomAlert from '../../../component-helpers/components/CustomAlert';

const SignatureModalBackdrop = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1002;
`;

const SignatureModalContainer = styled.div`
    background-color: white;
    padding: 30px;
    border-radius: 10px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
    width: 90%;
    max-width: 360px;
    max-height: 80vh;
    overflow-y: auto;
    z-index: 1005;
`;

const QrDiv = styled.div`
    color: white;
    display: flex;
    margin-inline: auto;
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
        max-width: fit-content;
        padding: 0.7rem;
        color: white;
    }
`;

const SubscriptionResolveData = styled.div`
    em {
        color: purple;
        word-break: break-all;
        text-align: start;
    }
`;

// eslint-disable-next-line react/prop-types
const SignatureModal = ({ documentId, onClose, documentHash, onSignatureSuccess }) => {
    const [signaturePayload, setSignaturePayload] = useState({});
    const [subscriptionResolveData, setSubscriptionResolveData] = useState(null);
    const [waitingForSignature, setWaitingForSignature] = useState(false);
    const [showCustomAlert, setShowCustomAlert] = useState(false);
    const [customAlertMessage, setCustomAlertMessage] = useState('');
    const [payloadResolved, setPayloadResolved] = useState(false);
    const [accountObject] = useContext(AccountContext);
    const navigate = useNavigate();

    useEffect(() => {
        // Check if the user is not logged in
        if (!accountObject.loggedIn) {
            // User is not logged in; set the message for non-logged-in users and show the alert
            setCustomAlertMessage(
                'You are about to sign this document without being logged in, your signature will still be stored to your wallet which can be attached to an account created in the future. However, you do lose some added signature security checks such as assurance you have not already signed this document.'
            );
            setShowCustomAlert(true);
        }
        // Check if the user is logged in but hasn't authenticated a wallet
        else if (accountObject.loggedIn && accountObject.wallet_address == null) {
            // User is logged in but hasn't authenticated a wallet; set the message for wallet authentication and show the alert
            setCustomAlertMessage(
                'You are logged in, but have not authenticated a wallet. For added signature security such as assurance you have not already signed this document, please authenticate.'
            );
            setShowCustomAlert(true);
        }
        // Proceed with generating the signature payload if the user decides to continue or has a wallet authenticated
        else if (accountObject.wallet_address != null) {
            generateSignaturePayload();
        }
    }, [documentHash, accountObject]);

    async function subscribeToPayload(payloadUuid) {
        console.log('SUBSCRIBE TO PAYLOAD FIRING');
        setWaitingForSignature(true); // Indicate waiting for a signature
        try {
            const response = await axiosInstance.post('/api/xrpl/payload/subscribe', { payloadUuid });
            if (response.data && response.status === 200) {
                const resolvedSignatureData = response.data;
                setPayloadResolved(true); // Indicate the payload has been resolved
                setWaitingForSignature(false); // No longer waiting for a signature
                setSubscriptionResolveData(resolvedSignatureData);

                if (resolvedSignatureData.signed) {
                    // Proceed with signature payload processing
                    const signaturePayload = {
                        documentId,
                        xrplTxHash: resolvedSignatureData.txHash,
                        signerWalletAddress: resolvedSignatureData.signer,
                        documentChecksum: documentHash,
                    };

                    const signatureResponse = await axiosInstance.post('/api/signature', signaturePayload);
                    onSignatureSuccess(signatureResponse.data.signature); //callback to re-run signatures fetch in parent component (DocumentPage)
                }
            }
        } catch (error) {
            console.error('Error inside subscribe function:', error);
            setWaitingForSignature(false); // Ensure we're not left in a waiting state on error
        }
    }

    const generateSignaturePayload = async () => {
        // Reset resolved signature payloads
        setSubscriptionResolveData(null);

        // Ensure documentHash is available
        if (!documentHash) return;

        try {
            const response = await axiosInstance.post('/api/xrpl/payload/create/transaction/signature', {
                documentHash,
            });
            if (response.data && response.status == 200) {
                setSignaturePayload(response.data);
                await subscribeToPayload(response.data.uuid);
            }
        } catch (error) {
            console.error('Error generating signature payload:', error);
        }
    };

    // Handle 'Continue Anyway' action
    const handleContinue = () => {
        setShowCustomAlert(false);
        // setShouldGeneratePayload(true);

        generateSignaturePayload();
    };

    return (
        <>
            {showCustomAlert && (
                <CustomAlert
                    customAlertMessage={customAlertMessage}
                    onContinue={handleContinue}
                    onNavigate={() => (accountObject.loggedIn ? navigate('/profile') : navigate('/register-user'))}
                    loggedIn={accountObject.loggedIn}
                />
            )}
            <SignatureModalBackdrop onClick={onClose}>
                <SignatureModalContainer onClick={(e) => e.stopPropagation()}>
                    <div>
                        <p>Scan and sign the below xumm qr code to generate an on-chain signature transaction:</p>
                    </div>

                    {signaturePayload && (
                        <QrDiv>
                            <a href={signaturePayload?.qrLink} target="_blank" rel="noreferrer">
                                <img src={signaturePayload?.qrImage} />
                            </a>
                        </QrDiv>
                    )}

                    {!waitingForSignature && payloadResolved ? <p style={{ color: 'blue' }}>Signature Payload has resolved.</p> : null}

                    {subscriptionResolveData && (
                        <SubscriptionResolveData>
                            <p>
                                Document Signature Status:{' '}
                                <em style={{ color: 'purple' }}>{subscriptionResolveData.signed ? 'Signed' : 'Rejected'}</em>
                            </p>
                            <p>
                                on-ledger transaction hash: <br />
                                <a
                                    href={`https://devnet.xrpl.org/transactions/${subscriptionResolveData?.txHash}/detailed`}
                                    target="_blank"
                                    rel="noreferrer noopener"
                                >
                                    <em style={{ color: 'purple', wordWrap: 'wrap' }}>{subscriptionResolveData?.txHash}</em>
                                </a>
                            </p>
                        </SubscriptionResolveData>
                    )}
                </SignatureModalContainer>
            </SignatureModalBackdrop>
        </>
    );
};

export default SignatureModal;
