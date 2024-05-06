import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { handleDecrypt } from '../../../../utils/rsaKeyHandlers/helpers';
import SignatureModal from './SignatureModal';

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
    width: 86%;
    max-width: 500px;
    max-height: 80vh;
    overflow-y: auto; // scrollable
    word-wrap: break-word;
    z-index: 1001;
`;

const ModalTitle = styled.h5`
    padding: 0px 15px;
    font-size: 1.2em;
    margin-bottom: 0px;
    margin-top: 15px;
`;

const DocumentSecurityLevel = styled.h4`
    margin-top: 0px;
    padding: 0px 15px;
    text-transform: uppercase;
    font-size: 0.85em;
    color: #216c97;
    margin-bottom: 5px;
`;

const IpfsLink = styled.a`
    font-size: 0.65em;
    padding: 4px 15px;
    text-decoration: none;
    color: #777;
    border: 1px solid black;
    margin-left: 15px;
    margin-top: 5px;
    border-radius: 4px;

    &:hover {
      color: #333;
    }
`;

const DocumentDataDisplaySection = styled.section`
    padding: 0px 20px;
`;

const IpfsDocumentData = styled.div`
    h5 {
        margin-bottom: 0px;
        margin-top: 32px;
        text-decoration: underline;
        color: #c27721;
    }
`;

const DataBaseDocumentData = styled.div`
    margin-bottom: 50px;
    h5 {
        margin-bottom: 0px;
        text-decoration: underline;
        color: #c27721;
    }
`;

const DataList = styled.ul`
    text-decoration: none;
    list-style: none;
    font-size: 0.8em;
    padding: 0px;
    margin-top: 6px;

    li {
        em {
            color: #858585;
        }
    }
`;

const KeyText = styled.strong`
    color: purple;
`;

const PrivateKetInputSection = styled.section`
    padding: 0px 20px;
    margin-block: 15px;
    font-size: 0.8em;
    display: flex;
    gap: 5px;
    justify-content: start;
    align-items: center;
    flex-wrap: wrap;
`;

const DecryptButton = styled.button``;

// eslint-disable-next-line react/prop-types
function DocumentDetailsModal({ dbDocData, userHashedEmail, onClose }) {
    const [showSignatureModal, setShowSignatureModal] = useState(false);
    const [currentDocumentCid, setCurrentDocumentCid] = useState(null);
    const [documentData, setDocumentData] = useState(null);
    const [decryptedFileObject, setDecryptedFileObject] = useState(null);
    const [userPrivateKeyBase64, setUserPrivateKeyBase64] = useState(''); // New state for user's private key

    useEffect(() => {
        const fetchDocumentData = async () => {
            try {
                // Remove 'ipfs://' prefix if it exists and take the rest of the string as the CID
                // eslint-disable-next-line react/prop-types
                const actualCid = dbDocData.ipfs_hash.replace(/^ipfs:\/\//, '');
                const response = await fetch(`https://ipfs.io/ipfs/${actualCid}`);
                const data = await response.json();
                console.log('IPFS data retrieved: ', data);
                setDocumentData(data);
                setCurrentDocumentCid(actualCid);
            } catch (error) {
                console.error('Error fetching document data:', error);
            }
        };

        fetchDocumentData();
    }, [dbDocData.ipfs_hash]);

    const closeBothModals = () => {
        setShowSignatureModal(false);
        onClose();
    };

    const decryptDocument = async () => {
        try {
            const encryptedAesKeyForThisAccount = documentData.document.data.accessControls[userHashedEmail];
            console.log(documentData);
            console.log(encryptedAesKeyForThisAccount);
            const decryptedArrayBuffer = await handleDecrypt(
                userPrivateKeyBase64,
                encryptedAesKeyForThisAccount,
                documentData
            );
            console.log('TESTINS DOCUMENT DATA: ', documentData);
            // Determine the file name and type (set default values if not known)
            const fileName = documentData.document.originalFileName || 'decryptedFile';
            const fileType = documentData.document.originalFileFormat || 'application/octet-stream'; // Default MIME type

            // Create a new File object from the ArrayBuffer
            const decryptedFile = new File([decryptedArrayBuffer], fileName, { type: fileType });
            console.log('TESTING CONVERTED FILE: ', decryptedFile);

            setDecryptedFileObject(decryptedFile);
            setShowSignatureModal(true);
        } catch (error) {
            console.error('Error during decryption:', error);
        }
    };

    return (
        <ModalBackdrop onClick={onClose}>
            <ModalContainer onClick={(e) => e.stopPropagation()}>
                <ModalTitle>Document Details</ModalTitle>
                <DocumentSecurityLevel>{documentData?.encrypted ? 'Encrypted' : 'Unencrypted'}</DocumentSecurityLevel>
                {dbDocData?.ipfs_hash && (
                    <IpfsLink
                        className="buttonPop"
                        href={`https://ipfs.io/ipfs/${dbDocData?.ipfs_hash}`}
                        target="_blank"
                        rel="noreferrer"
                    >
                        View on IPFS
                    </IpfsLink>
                )}

                {documentData ? (
                    <DocumentDataDisplaySection>
                        <IpfsDocumentData>
                            <h5>IPFS Document Data:</h5>
                            <DataList>
                                <li>
                                    Uploaded By: <em>{documentData.author}</em>
                                </li>
                                <li>
                                    Encrypted: <em>{documentData.encrypted ? 'True' : 'False'}</em>
                                </li>
                                <li>
                                    Type: <em>{documentData.document.originalFileFormat}</em>
                                </li>
                                <li>
                                    Name: <em>{documentData.document.originalFileName}</em>
                                </li>
                                <li>
                                    Category: <em>{documentData.document.metadata.category}</em>
                                </li>
                                <li>
                                    Description: <em>{documentData.description}</em>
                                </li>
                                <li>
                                    Required Signers: <em>{documentData.requiredSignersWallets}</em>
                                </li>
                            </DataList>
                        </IpfsDocumentData>
                        <DataBaseDocumentData>
                            <h5>Database Document User Relationships:</h5>
                            <DataList>
                                <li>
                                    Signature Status:{' '}
                                    <em>
                                        {dbDocData.is_signed
                                            ? dbDocData.missing_signatures.length === 0
                                                ? 'Complete'
                                                : 'Partial'
                                            : 'Pending'}
                                    </em>
                                </li>
                                <li>
                                    Need to Sign Still: <em>{dbDocData.missing_signatures.join(', ') || 'None'}</em>
                                </li>
                                <li>
                                    Have Signed Already:{' '}
                                    <em>
                                        {dbDocData.required_signers_wallets
                                            .filter((wallet) => !dbDocData.missing_signatures.includes(wallet))
                                            .join(', ') || 'None'}
                                    </em>
                                </li>
                                <li>
                                    Current Signature Hashes:
                                    <ul>
                                        {dbDocData.xrpl_tx_hashes.map((tx_hash, index) => (
                                            <li key={index}>
                                                <a
                                                    href={`https://testnet.xrpl.org/transactions/${tx_hash}/raw`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    {tx_hash}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </li>
                            </DataList>
                        </DataBaseDocumentData>
                    </DocumentDataDisplaySection>
                ) : (
                    <div>Loading...</div>
                )}

                {/* Input for user's private key */}
                <PrivateKetInputSection>
                    <label htmlFor="privateKeyInput">Private Key:</label>
                    <input
                        type="text"
                        id="privateKeyInput"
                        value={userPrivateKeyBase64}
                        onChange={(e) => setUserPrivateKeyBase64(e.target.value)}
                    />
                    <DecryptButton onClick={decryptDocument}>Decrypt Document</DecryptButton>
                </PrivateKetInputSection>
            </ModalContainer>
            {showSignatureModal && (
                <SignatureModal
                    decryptedFileObject={decryptedFileObject}
                    onClose={() => closeBothModals()}
                    documentId={dbDocData.id}
                    cid={dbDocData.ipfs_hash}
                />
            )}
        </ModalBackdrop>
    );
}

export default DocumentDetailsModal;
