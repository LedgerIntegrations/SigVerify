import { useContext, useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { fetchUserPublicKeyAndWallet } from '../../../../utils/httpRequests/routes/users';
import { webCryptoApiHybridEncrypt } from '../../../../utils/rsaKeyHandlers/helpers';
import { uploadDocument } from '../../../../utils/httpRequests/routes/documents';
import ErrorModal from '../../../../utils/reusedComponents/ErrorModal';
import { AccountContext } from '../../../../App';
import LoadingIcon from '../../../helperComponents/LoadingIcon/LoadingIcon';

//? becoming large component, potential need to modularize functionality

const Container = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-inline: 5px;
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
        margin-bottom: 10px;
        label {
            min-width: 30%;
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
        margin-top: 40px;
        padding: 6px 15px;
        border-radius: 5px;
        font-size: 14px;
        border: 1px solid black;
        width: 50%;
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

    const [customFormData, setCustomFormData] = useState({
        title: '',
        description: '',
        category: '',
        emails: '',
    });

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // TODO: convert current react recipient email input element to a (+) button feature that adds new input boxes for multiple emails, removing the comma seperated string current implementation
            const emailArray = customFormData.emails.split(',').map((email) => email.trim());

            const hashedEmailPromises = emailArray.map((email) => return256Hash(email));
            const hashedEmails = await Promise.all(hashedEmailPromises);
            const publicKeyAndWalletPromises = hashedEmails.map(async (hashedEmail, index) => {
                try {
                    const {
                        data: { data: userData },
                    } = await fetchUserPublicKeyAndWallet(hashedEmail);
                    return {
                        publicKey: userData.publicKey,
                        wallet: userData.verifiedWallet,
                    };
                } catch (error) {
                    // Update the error message to include the specific email
                    setErrorMessage(`No user was found for the email: ${emailArray[index]}`);
                    setShowErrorModal(true);
                }
            });
            // returned list of queried publickey, and wallet from centalized db by given email
            const publicKeysWithHashedEmailsAndWallet = await Promise.all(publicKeyAndWalletPromises);

            // convert uploaded file to an ArrayBuffer to uniformlly manage the document raw data
            const arrayBufferOfFile = await readFileAsArrayBuffer(uploadedFile);
            // hash raw file binary data for trustless document tamper resistance
            const sha256HashOfOriginalFileBinary = await return256Hash(arrayBufferOfFile);

            // payload placeholder to add payloads if multiple recipients designated to be sent to server via iterable
            let payloads = [];

            // dynamically change document payload to be encrypted or unencrypted based on user selection
            if (encryptDocument) {
                const publicKeys = publicKeysWithHashedEmailsAndWallet.map(({ publicKey }) => publicKey);
                const encryptionResults = await webCryptoApiHybridEncrypt(publicKeys, arrayBufferOfFile);
                console.log('encrypted document results: ', encryptionResults);

                // only thing changing is 'encrypted', 'encryptedProperties', and 'rawProperties' data
                payloads = await encryptionResults.map((encryptionResult, index) => ({
                    original_file_name: uploadedFile.name,
                    original_file_format: uploadedFile.type,
                    original_file_size: uploadedFile.size,
                    original_file_hash: sha256HashOfOriginalFileBinary,
                    required_signers_wallets: publicKeysWithHashedEmailsAndWallet.map(({ wallet }) => wallet),
                    recipient_signer_wallet: publicKeysWithHashedEmailsAndWallet[index].wallet,
                    metadata: {
                        title: customFormData.title,
                        description: customFormData.description,
                        category: customFormData.category,
                        creation_date: new Date().toISOString(),
                        author: accountObject.xrplWalletAddress,
                        all_recipients: hashedEmails,
                        receiver: hashedEmails[index],
                    },
                    encrypted: true,
                    encryptionProperties: {
                        encrypted_data: encryptionResult.encryptedData,
                        encrypted_aes_key: encryptionResult.encryptedAesKeyBase64,
                        iv_base64: encryptionResult.iv,
                        encrypted_data_format: 'base64',
                        encryption_algorithm: 'AES-GCM',
                        encryption_aes_key_length: 256,
                        encryption_aes_key_hash: encryptionResult.aesKeyHash,
                    },
                    rawProperties: null,
                }));
            } else {
                const rawPropertiesPromises = hashedEmails.map(async (item, index) => {
                    const unencryptedDataBase64 = await arrayBufferToBase64(arrayBufferOfFile);
                    return {
                        original_file_name: uploadedFile.name,
                        original_file_format: uploadedFile.type,
                        original_file_size: uploadedFile.size,
                        original_file_hash: sha256HashOfOriginalFileBinary,
                        required_signers_wallets: publicKeysWithHashedEmailsAndWallet.map(({ wallet }) => wallet),
                        recipient_signer_wallet: publicKeysWithHashedEmailsAndWallet[index].wallet,
                        metadata: {
                            title: customFormData.title,
                            description: customFormData.description,
                            category: customFormData.category,
                            creation_date: new Date().toISOString(),
                            author: accountObject.xrplWalletAddress,
                            all_recipients: hashedEmails,
                            receiver: hashedEmails[index],
                        },
                        encrypted: false,
                        encryptionProperties: null,
                        rawProperties: {
                            unencrypted_data: unencryptedDataBase64,
                            unencrypted_data_format: 'base64',
                        },
                    };
                });

                payloads = await Promise.all(rawPropertiesPromises);
            }

            // Uploading each encrypted document iterably
            for (const payload of payloads) {
                // send document payload with metadata to server to be formatted and stored on ipfs
                const responseData = await uploadDocument(payload);
                console.log(responseData);
            }

            // TODO: uploaded document metadata and created document ipfs cid linked to creating rAddress and recipient rAddresses in centralized db for faster querying / sorting of viewable documents and their relations

            // navigate('/documents');
        } catch (error) {
            console.error('Error during document upload:', error);
            setLoading(false);
            setUploadComplete(false);
        } finally {
            setUploadedFile(null);
            setLoading(false);
            setUploadComplete(true);
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
                {uploadComplete && (
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
                                <label>Recipient Emails:</label>
                                <RecipientTextInput
                                    type="text"
                                    name="emails"
                                    value={customFormData.emails}
                                    onChange={handleChange}
                                    placeholder="Enter emails separated by commas"
                                />
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
