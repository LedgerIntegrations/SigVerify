import { useState, useContext, useEffect } from 'react';
import DocumentViewer from './DocumentViewer';
import CreateSignatureAndResolve from '../../../XrplDependentComponents/CreateSignatureAndResolve';
import { AccountContext } from '../../../../App';
import styled from 'styled-components';
import { addDocumentSignature } from '../../../../utils/httpRequests/routes/documents';

const SignatureModalBackdrop = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.7); // Slightly darker than the first modal
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1002; // Higher than the first modal
`;

const SignatureModalContainer = styled.div`
    background-color: white;
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
    width: 90%;
    max-width: 450px;
    max-height: 80vh;
    overflow-y: auto;
    z-index: 1002;
`;

const CloseButton = styled.button``;
const SignButton = styled.button``;

const SignatureModal = ({ decryptedFileObject, onClose, documentId, cid }) => {
    const [signatureStatus, setSignatureStatus] = useState(null);
    const [signatureSubmitted, setSignatureSubmitted] = useState(false);
    const [payloadSigningComponentOpened, setPayloadSigningComponentOpened] = useState(false);
    const [accountObject] = useContext(AccountContext);

    const handleSignDocument = () => {
        setPayloadSigningComponentOpened(true);
    };

    useEffect(() => {
        if (
            signatureStatus?.signed &&
            signatureStatus?.resolveData.dispatchedResult === 'tesSUCCESS' &&
            !signatureSubmitted
        ) {
            console.log('signature resolveData: ', signatureStatus.resolveData);
            addSignatureToDatabase();
            setSignatureSubmitted(true); // Set the flag to prevent duplicate submissions
        }
    }, [signatureStatus]); // Dependency array ensures this effect runs only when signatureStatus changes

    const handleClose = () => {
        onClose(); // Close the modal
    };
    const addSignatureToDatabase = async () => {
        try {
            const addDocumentSignatureResponse = await addDocumentSignature(
                documentId,
                signatureStatus.resolveData.txHash
            );
            console.log('Document signature database post response: ', addDocumentSignatureResponse);

        } catch (error) {
            console.error('Error in adding document signature: ', error);
            // Handle error appropriately
        }
    };

    return (
        <SignatureModalBackdrop onClick={onClose}>
            <SignatureModalContainer onClick={(e) => e.stopPropagation()}>
                <div>
                    <p>Decrypted Content:</p>
                    <DocumentViewer currentDocument={decryptedFileObject} />
                </div>
                {!signatureStatus?.signed && <SignButton onClick={handleSignDocument}>Sign Document</SignButton>}

                {payloadSigningComponentOpened && (
                    <div>
                        <CreateSignatureAndResolve
                            setPayloadSigningComponentOpened={setPayloadSigningComponentOpened}
                            memoData={cid}
                            setSignatureStatus={setSignatureStatus}
                        />
                    </div>
                )}
                {signatureStatus?.signed ? (
                    <p style={{ color: 'green' }}>Successfully signed document!</p>
                ) : (
                    <p style={{ color: 'blue' }}>Waiting for document signature...</p>
                )}
                {signatureStatus && (
                    <div>
                        <p>
                            Document Signature Status:{' '}
                            <em style={{ color: 'purple' }}>{signatureStatus.signed ? 'Signed' : 'Rejected'}</em>
                        </p>
                        <p>
                            on-ledger transaction hash:{' '}
                            <em style={{ color: 'purple', wordWrap: 'wrap' }}>
                                {signatureStatus?.resolveData?.txHash}
                            </em>
                        </p>
                        <CloseButton onClick={handleClose}>Close</CloseButton>
                    </div>
                )}
            </SignatureModalContainer>
        </SignatureModalBackdrop>
    );
};

export default SignatureModal;
