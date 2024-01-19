import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { handleDecrypt } from '../../../../utils/rsaKeyHandlers/helpers';
import DocumentViewer from './DocumentViewer';

const ModalBackdrop = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.6);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1001;
`;

const ModalContainer = styled.div`
    background-color: white;
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
    width: 80%;
    max-width: 500px;
    max-height: 80vh;
    overflow-y: auto; // scrollable
    word-wrap: break-word; // Ensure text wraps to avoid overflow
    z-index: 1001;
`;

const KeyText = styled.strong`
    color: purple;
`;

const DecryptButton = styled.button``;

// eslint-disable-next-line react/prop-types
function DocumentDetailsModal({ cid, onClose }) {
    const [documentData, setDocumentData] = useState(null);
    const [decryptedFileObject, setDecryptedFileObject] = useState(null);
    const [userPrivateKeyBase64, setUserPrivateKeyBase64] = useState(''); // New state for user's private key

    useEffect(() => {
        const fetchDocumentData = async () => {
            try {
                // Remove 'ipfs://' prefix if it exists and take the rest of the string as the CID
                // eslint-disable-next-line react/prop-types
                const actualCid = cid.replace(/^ipfs:\/\//, '');
                const response = await fetch(`https://ipfs.io/ipfs/${actualCid}`);
                const data = await response.json();
                console.log('IPFS data retrieved: ', data);
                setDocumentData(data);
            } catch (error) {
                console.error('Error fetching document data:', error);
                // Handle fetch error (e.g., show error message)
            }
        };

        fetchDocumentData();
    }, [cid]);

    const decryptDocument = async () => {
        try {
            const decryptedArrayBuffer = await handleDecrypt(userPrivateKeyBase64, documentData);
            console.log('TESTINS DOCUMENT DATA: ', documentData);
            // Determine the file name and type (set default values if not known)
            const fileName = documentData.properties.original_file_name || 'decryptedFile';
            const fileType = documentData.properties.original_file_format || 'application/octet-stream'; // Default MIME type

            // Create a new File object from the ArrayBuffer
            const decryptedFile = new File([decryptedArrayBuffer], fileName, { type: fileType });
            console.log('TESTING CONVERTED FILE: ', decryptedFile);

            setDecryptedFileObject(decryptedFile);
        } catch (error) {
            console.error('Error during decryption:', error);
            // Handle decryption error (e.g., show error message)
        }
    };

    const renderDocumentDetails = (data) => {
        return Object.entries(data).map(([key, value]) => {
            // Recursively render properties if the value is an object
            if (typeof value === 'object' && value !== null) {
                return (
                    <div key={key}>
                        <KeyText>{key}:</KeyText>
                        {renderDocumentDetails(value)} {/* Recursive call for nested objects */}
                    </div>
                );
            }
            return (
                <p key={key}>
                    <KeyText>{key}:</KeyText> {value}
                </p>
            );
        });
    };

    return (
        <ModalBackdrop onClick={onClose}>
            <ModalContainer onClick={(e) => e.stopPropagation()}>
                <h2>Document Details</h2>
                {documentData ? renderDocumentDetails(documentData) : <div>Loading...</div>}

                {/* Input for user's private key */}
                <div>
                    <label htmlFor="privateKeyInput">Your Private Key:</label>
                    <input
                        type="text"
                        id="privateKeyInput"
                        value={userPrivateKeyBase64}
                        onChange={(e) => setUserPrivateKeyBase64(e.target.value)}
                    />
                </div>

                <DecryptButton onClick={decryptDocument}>Decrypt Document</DecryptButton>
                {decryptedFileObject && (
                    <div>
                        <p>Decrypted Content:</p>
                        <DocumentViewer currentDocument={decryptedFileObject} />
                    </div>
                )}
            </ModalContainer>
        </ModalBackdrop>
    );
}

export default DocumentDetailsModal;
