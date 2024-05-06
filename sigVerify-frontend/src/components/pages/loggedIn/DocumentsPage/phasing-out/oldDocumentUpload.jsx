import { useContext, useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { fetchUserPublicKeyAndWalletByHashedEmail } from '../../../../utils/httpRequests/routes/users';
import { webCryptoApiHybridEncrypt } from '../../../../utils/rsaKeyHandlers/helpers';
import { uploadDocument } from '../../../../utils/httpRequests/routes/documents';
import ErrorModal from '../../../../utils/reusedComponents/ErrorModal';
import { AccountContext } from '../../../../App';
import LoadingIcon from '../../../helperComponents/LoadingIcon/LoadingIcon';
import { FaTrashAlt } from 'react-icons/fa';

// import { upload } from '../../../../../../sigVerify-backend/config/s3Bucket';

//? becoming large component, potential need to modularize functionality
//!! NEED TO MODULARIZE COMPONENT SOON GETTING TOO LARGE

const Container = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
`;

const UploadDocumentContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 95%;
    max-width: 400px;
`;

const UploadDragBox = styled.div`
    display: flex;
    flex-direction: column;
    gap: 15px;
    margin-bottom: 20px;
    margin-top: 30px;
    border: 2px dashed ${(props) => (props.$isDragActive ? 'rgb(32, 109, 252);' : 'rgb(102, 148, 233);')};
    height: 140px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    text-align: center;
    width: 95%;
    border-radius: 20px;
    padding-inline: 40px;
    font-size: 13px;
    background-color: rgb(227, 234, 245);

    svg {
        height: 50px;
        width: 50px;
        color: rgb(102, 148, 233);
    }
`;

const HiddenUploadInput = styled.input`
    display: none;
`;

const UploadFileBox = styled.div`
    text-align: start;
    width: 100%;
`;

const UplaodedFileDiv = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
    margin-top: 10px;
    border-bottom: 1px solid black;
    border-radius: 5px;
    padding: 10px;

    button {
        border: none;
        background-color: white;
        padding: 2px;
        border-radius: 5px;
    }

    svg {
        color: #fa6161;

        &:hover {
            color: red;
        }
    }
`;

const DocumentForm = styled.form`
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: start;
    align-items: start;
    border-radius: 5px;
    padding: 5px;

    div {
        width: 100%;
        text-align: start;
        display: flex;
        align-items: start;
        gap: 3px;
        margin-bottom: 6px;

        > * div {
            display: flex;
            align-items: center;
        }

        label {
            min-width: 33%;
            font-size: 0.85em;
        }

        input {
            width: 100%;
        }

        select {
            font-size: 14px;
            width: 100%;
        }

        textarea {
            width: 100%;
        }
    }
`;

const SubmitFormButtonContainer = styled.div`
    width: 100%;
    display: flex;
    justify-content: center;

    button {
        margin-top: 20px;
        padding: 6px 15px;
        border-radius: 5px;
        font-size: 14px;
        border: 1px solid #888;
        width: 95%;
        color: #888;

        &:hover {
            color: black;
        }
    }
`;

const RecipientTextInput = styled.input`
    font-size: 0.8em;
`;

const LoadingComponent = styled.div``;

const UploadComplete = styled.div``;

const EncryptDocumentInput = styled.div`
    input {
        width: 50%;
    }
`;

const EmailTextInputBoxesContainer = styled.div`
    display: flex;
    flex-direction: column;
`;

const AddEmailInputButton = styled.button`
    font-size: 0.8em;
`;

const DeleteEmailIcon = styled(FaTrashAlt)`
    cursor: pointer;
    margin-left: 10px;
    color: red;
`;

const UploadDocumentComponent = () => {
    const navigate = useNavigate();

    // eslint-disable-next-line no-unused-vars
    const [accountObject, setAccountObject] = useContext(AccountContext);
    const [errorMessage, setErrorMessage] = useState('');
    const [showErrorModal, setShowErrorModal] = useState(false);

    const [isDragActive, setIsDragActive] = useState(false);
    const [uploadedFile, setUploadedFile] = useState(null);
    const [loading, setLoading] = useState(false); // array of temp uploaded files
    const [uploadComplete, setUploadComplete] = useState(false);
    const [documents, setDocuments] = useState([]); // This will hold all documents
    const [encryptDocument, setEncryptDocument] = useState(true); // encryption by default

    const [signerEmails, setSignerEmails] = useState([]);
    const [viewerEmails, setViewerEmails] = useState([]);

    const [customFormData, setCustomFormData] = useState({
        title: '',
        description: '',
        category: '',
    });

    const handleSignerEmailChange = (index, value) => {
        const updatedEmails = [...signerEmails];
        updatedEmails[index] = value;
        setSignerEmails(updatedEmails);
    };

    const handleViewerEmailChange = (index, value) => {
        const updatedEmails = [...viewerEmails];
        updatedEmails[index] = value;
        setViewerEmails(updatedEmails);
    };

    // Functions to add a new email field
    const addSignerEmailField = () => {
        setSignerEmails([...signerEmails, '']);
    };

    const addViewerEmailField = () => {
        setViewerEmails([...viewerEmails, '']);
    };

    const removeSignerEmailField = (index) => {
        setSignerEmails(signerEmails.filter((_, i) => i !== index));
    };

    const removeViewerEmailField = (index) => {
        setViewerEmails(viewerEmails.filter((_, i) => i !== index));
    };

    async function returnArrayOfSha256HashedEmails(arrayOfEmails) {
        const hashedEmailPromises = arrayOfEmails.map((email) => return256Hash(email.trim()));
        const hashedEmailArray = await Promise.all(hashedEmailPromises);
        console.log('hashed email array: ', hashedEmailArray);
        return hashedEmailArray;
    }

    //! later want to seperate this to return pubKeys and wallets seperately for unecrypted docs to unauthenticated users (no reg wallet yet)
    //* [ raw email ] --> [ { emailHash, publicKey, wallet } ]
    async function fetchPublicKeysAndWalletsForEmails(emailsArray, usersMustHaveAuthenticatedWallets) {
        // Hash the emails
        const hashedEmails = await returnArrayOfSha256HashedEmails(emailsArray);

        // Fetch public keys and wallets for each hashed email
        const publicKeyHashedEmailAndWalletPromises = hashedEmails.map(async (hashedEmail, index) => {
            try {
                const response = await fetchUserPublicKeyAndWalletByHashedEmail(hashedEmail);
                const userData = response.data.data;

                if (usersMustHaveAuthenticatedWallets && userData.verifiedWallet === null) {
                    throw new Error('Found a user without an authenticated xrpl wallet.');
                }
                return {
                    emailHash: hashedEmail,
                    publicKeyBase64: userData.publicKey,
                    wallet: userData.verifiedWallet,
                };
            } catch (error) {
                setErrorMessage(
                    `Either the user does not exist or they have not authenticated a xrpl wallet for email: ${emailsArray[index]} `
                );
                setShowErrorModal(true);
                throw new Error('Invalid email or a recipient user wallet not authenticated.');
            }
        });

        // Return the array of public keys and wallets
        return Promise.all(publicKeyHashedEmailAndWalletPromises);
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCustomFormData((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    async function readFileAsArrayBuffer(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => resolve(event.target.result);
            reader.onerror = (error) => reject(error);
            reader.readAsArrayBuffer(file);
        });
    }

    const arrayBufferToBase64 = async (buffer) => {
        const bytes = await new Uint8Array(buffer);
        const binary = await bytes.reduce((acc, byte) => acc + String.fromCharCode(byte), '');
        return btoa(binary);
    };

    async function return256Hash(data) {
        const encoder = new TextEncoder();
        const buffer = encoder.encode(data);
        const hashBuffer = await window.crypto.subtle.digest('SHA-256', buffer);
        return Array.from(new Uint8Array(hashBuffer))
            .map((b) => b.toString(16).padStart(2, '0'))
            .join('');
    }

    const return512HashOfArrayBuffer = async (data) => {
        const hashedData = await window.crypto.subtle.digest('SHA-512', data);
        return hashedData;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        //TODO: can modify for only encrypted document handling to throw error later
        if (!accountObject.xrplWalletAddress) {
            setErrorMessage(
                "You must first authenticate a XRPL wallet if you want to use our document functionality. Navigate to the 'Profile Page' and click authenticate wallet."
            );
            setShowErrorModal(true);
            throw new Error('You must first authenticate a XRPL wallet if you want to use our document functionality.');
        }

        setLoading(true);

        try {
            // hashing and encoding raw uploaded file data
            const arrayBufferOfFile = await readFileAsArrayBuffer(uploadedFile);
            const sha512HashOfOriginalFileArrayBuffer = await return512HashOfArrayBuffer(arrayBufferOfFile);
            const base64EncodedSha512HashOfOriginalFileArrayBuffer = await arrayBufferToBase64(
                sha512HashOfOriginalFileArrayBuffer
            );

            // payload placeholder, will be updated depending on encryption status
            let payload;

            //* list of signer, viewer, all recipient, and unique all recipients [ { emailHash, publicKey, wallet } ]
            const arrayOfSignersPublicKeysEmailsAndWallets = await fetchPublicKeysAndWalletsForEmails(
                signerEmails,
                true
            );
            const arrayOfViewersPublicKeysEmailsAndWallets = await fetchPublicKeysAndWalletsForEmails(
                viewerEmails,
                false
            );
            const arrayOfAllPublicKeysEmailsAndWallets = [
                ...arrayOfSignersPublicKeysEmailsAndWallets,
                ...arrayOfViewersPublicKeysEmailsAndWallets,
            ];
            // in case user enters same email for signer and cc
            const uniqueArrayOfAllPublicKeysEmailsAndWallets = arrayOfAllPublicKeysEmailsAndWallets.reduce(
                (accumulator, current) => {
                    if (!accumulator.some((item) => item.emailHash === current.emailHash)) {
                        accumulator.push(current);
                    }
                    return accumulator;
                },
                []
            );

            // dynamically change document payload to be encrypted or unencrypted based on user selection
            if (encryptDocument) {
                // send list of all signers and cc users that can view encrypted to encryption function to return users with aesKeys
                const documentEncryptionResults = await webCryptoApiHybridEncrypt(
                    uniqueArrayOfAllPublicKeysEmailsAndWallets,
                    arrayBufferOfFile
                );

                console.log('documentEncryptionResults:', documentEncryptionResults);

                const accessControls =
                    documentEncryptionResults.arrayOfUsersWithCorrespondingEncryptedAesKeyUsingEachPublicKey.reduce(
                        (accumulator, { emailHash, encryptedAesKeyBase64 }) => {
                            accumulator[emailHash] = encryptedAesKeyBase64;
                            return accumulator;
                        },
                        {}
                    );

                // construct encrypted document payload to send to server
                payload = {
                    originalFileName: uploadedFile.name,
                    originalFileFormat: uploadedFile.type,
                    originalFileSize: uploadedFile.size,
                    base64EncodedSha512HashOfOriginalFileArrayBuffer,
                    requiredSignersWallets: arrayOfSignersPublicKeysEmailsAndWallets.map(({ wallet }) => wallet),
                    author: accountObject.xrplWalletAddress,
                    metadata: {
                        title: customFormData.title,
                        description: customFormData.description,
                        category: customFormData.category,
                        creationDate: new Date().toISOString(),
                    },
                    encrypted: true,
                    data: {
                        data: documentEncryptionResults.aesEncryptedDocumentDataArrayBufferBase64Encoded,
                        encryptionAesKeyHash:
                            documentEncryptionResults.sha512HashedArrayBufferOfExportedAesKeyBase64Encoded,
                        accessControls: accessControls,
                        ivBase64: documentEncryptionResults.ivUint8ArrayBase64Encoded,
                        encoding: 'base64',
                        documentDataEncryptionAlgorithm: 'AES-GCM',
                        encryptionAesKeyLength: 256,
                        aesKeysEncryptionAlgorithm: 'RSA-OAEP',
                    },
                };
            } else {
                const unencryptedDataBase64 = await arrayBufferToBase64(arrayBufferOfFile);
                // construct unencrypted document payload to send to server
                payload = {
                    originalFileName: uploadedFile.name,
                    originalFileFormat: uploadedFile.type,
                    originalFileSize: uploadedFile.size,
                    base64EncodedSha512HashOfOriginalFileArrayBuffer,
                    requiredSignersWallets: arrayOfSignersPublicKeysEmailsAndWallets.map(({ wallet }) => wallet),
                    author: accountObject.xrplWalletAddress,
                    metadata: {
                        title: customFormData.title,
                        description: customFormData.description,
                        category: customFormData.category,
                        creationDate: new Date().toISOString(),
                    },
                    encrypted: false,
                    data: {
                        data: unencryptedDataBase64,
                        encoding: 'base64',
                        accessControls: uniqueArrayOfAllPublicKeysEmailsAndWallets.map(({ emailHash }) => emailHash),
                    },
                };
            }
            console.log('payload:::: ', payload);

            // Upload document payload
            const responseData = await uploadDocument(payload);
            console.log('Document upload response data: ', responseData);

            setUploadComplete(true);
            setLoading(false);
            setUploadedFile(null);
        } catch (error) {
            console.error('Error during document upload:', error);
            setLoading(false); // Stop loading
        }
    };

    const onUpload = (newDocument) => {
        setDocuments([...documents, newDocument]);
    };

    const onDelete = () => {
        setUploadedFile(null);
    };

    const handleFileChange = (event) => {
        processFile(event.target.files[0]);
    };

    const onDrop = (event) => {
        event.preventDefault();
        setIsDragActive(false);
        if (event.dataTransfer.files && event.dataTransfer.files[0]) {
            processFile(event.dataTransfer.files[0]);
        }
    };

    const handleDragOver = (event) => {
        event.preventDefault();
    };

    const processFile = (file) => {
        if (file) {
            console.log('file inside processFile: ', file);
            setUploadedFile(file); // Add new file to the array
            onUpload({ name: file.name, isSigned: false });
        }
    };

    const openFileDialog = () => {
        document.getElementById('hiddenFileInput').click();
    };

    return (
        <Container className="pageContainer">
            <UploadDocumentContainer>
                <UploadDragBox
                    $isDragActive={isDragActive}
                    onClick={openFileDialog}
                    onDrop={onDrop}
                    onDragOver={handleDragOver}
                    onDragEnter={() => setIsDragActive(true)}
                    onDragLeave={() => setIsDragActive(false)}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                        />
                    </svg>
                    Drag and drop a file here, or click to select a file
                    <HiddenUploadInput id="hiddenFileInput" type="file" onChange={handleFileChange} />
                </UploadDragBox>
                {loading && (
                    <LoadingComponent>
                        <h6>Uploading Document to IPFS...</h6>
                        <LoadingIcon />
                    </LoadingComponent>
                )}
                {uploadComplete && !showErrorModal && (
                    <UploadComplete>
                        <h6>File uploaded successfully!</h6>
                        <button
                            onClick={() => {
                                navigate('/documents');
                            }}
                        >
                            view document
                        </button>
                    </UploadComplete>
                )}

                {uploadedFile && !loading && (
                    <UploadFileBox>
                        <UplaodedFileDiv>
                            <span>{uploadedFile.name}</span>
                            <button onClick={onDelete} className="buttonPop">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.5}
                                    stroke="currentColor"
                                    className="w-6 h-6"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                                    />
                                </svg>
                            </button>
                        </UplaodedFileDiv>
                        <DocumentForm onSubmit={handleSubmit}>
                            <div>
                                <label>Title:</label>
                                <input type="text" name="title" value={customFormData.title} onChange={handleChange} />
                            </div>
                            <div>
                                <label>Description:</label>
                                <textarea
                                    name="description"
                                    value={customFormData.description}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label>Category:</label>
                                <select name="category" value={customFormData.category} onChange={handleChange}>
                                    <option value="">Select a Category</option>
                                    <option value="medical">Medical</option>
                                    <option value="insurance">Insurance</option>
                                    <option value="financial">Financial</option>
                                    <option value="real estate">Real Estate</option>
                                    <option value="custom">Other</option>
                                </select>
                            </div>
                            <div>
                                <label>Required Signer Emails:</label>
                                <EmailTextInputBoxesContainer>
                                    {signerEmails.map((email, index) => (
                                        <div key={index}>
                                            <input
                                                type="text"
                                                value={email}
                                                onChange={(e) => handleSignerEmailChange(index, e.target.value)}
                                                placeholder="Enter signer email"
                                            />
                                            {signerEmails.length > 0 && (
                                                <DeleteEmailIcon onClick={() => removeSignerEmailField(index)} />
                                            )}
                                        </div>
                                    ))}
                                    <AddEmailInputButton type="button" onClick={addSignerEmailField}>
                                        Add Signer Email
                                    </AddEmailInputButton>
                                </EmailTextInputBoxesContainer>
                            </div>
                            <div>
                                <label>CC Emails (Viewers):</label>
                                <EmailTextInputBoxesContainer>
                                    {viewerEmails.map((email, index) => (
                                        <div key={index}>
                                            <input
                                                type="text"
                                                value={email}
                                                onChange={(e) => handleViewerEmailChange(index, e.target.value)}
                                                placeholder="Enter viewer email"
                                            />
                                            {viewerEmails.length > 0 && (
                                                <DeleteEmailIcon onClick={() => removeViewerEmailField(index)} />
                                            )}
                                        </div>
                                    ))}
                                    <AddEmailInputButton type="button" onClick={addViewerEmailField}>
                                        Add Viewer Email
                                    </AddEmailInputButton>
                                </EmailTextInputBoxesContainer>
                            </div>
                            <EncryptDocumentInput>
                                <label>Encrypt Document:</label>
                                <input
                                    style={{ width: '50px' }}
                                    type="checkbox"
                                    checked={encryptDocument}
                                    onChange={() => setEncryptDocument(!encryptDocument)}
                                />
                            </EncryptDocumentInput>
                            <SubmitFormButtonContainer>
                                <button type="submit" className="buttonPop">
                                    Submit
                                </button>
                            </SubmitFormButtonContainer>
                        </DocumentForm>
                    </UploadFileBox>
                )}
                {showErrorModal && <ErrorModal message={errorMessage} onClose={() => setShowErrorModal(false)} />}
            </UploadDocumentContainer>
        </Container>
    );
};

export default UploadDocumentComponent;
