import { useContext, useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { uploadDocument } from '../../../../utils/httpRequests/routes/documents';
import ErrorModal from '../../../../utils/reusedComponents/ErrorModal';
import { AccountContext } from '../../../../App';
import LoadingIcon from '../../../component-helpers/components/LoadingIcon';
// import { FaTrashAlt } from 'react-icons/fa';

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
            /* color: black; */
        }

        &:not(:disabled) {
            cursor: pointer; /* Reset cursor for enabled state */
            color: black;
        }

        &:disabled {
            color: lightgray; /* Text color for disabled state */
            background-color: #f9f9f9; /* Background color for disabled state */
            border: 1px solid #ccc; /* Lighter border color for disabled state */
        }
    }
`;

const LoadingComponent = styled.div``;

const UploadComplete = styled.div`
    transform: translateY(50%);
    width: 80vw;
    font-size: 2em;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    h6 {
        width: fit-content;
        color: green;
        font-family: 'exo';
    }

    button {
        padding: 10px 20px;
        font-size: 0.5em;
        border-radius: 10px;
        border: 1px solid black;
        font-family: 'Kdam Thmor Pro', sans-serif;
    }
`;

const PublicDocumentInput = styled.div`
    input {
        width: 50%;
    }
`;

const UploadDocumentComponent = () => {
    const navigate = useNavigate();
    const [accountObject, setAccountObject] = useContext(AccountContext); // Assuming this is correct context usage
    const [errorMessage, setErrorMessage] = useState('');
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [isDragActive, setIsDragActive] = useState(false);
    const [uploadedFile, setUploadedFile] = useState(null);
    const [isHashing, setIsHashing] = useState(false);
    const [publicDocument, setPublicDocument] = useState(false);

    const [loading, setLoading] = useState(false); // array of temp uploaded files
    const [uploadComplete, setUploadComplete] = useState(false);

    const [customFormData, setCustomFormData] = useState({
        title: '',
        description: '',
        category: '',
        publicFlag: false, // This will be updated directly in the state
    });
    const [isFormValid, setIsFormValid] = useState(false);

    // Form validation effect
    useEffect(() => {
        const isValid =
            customFormData.title.trim() &&
            customFormData.description.trim() &&
            customFormData.category.trim() &&
            uploadedFile && // Ensure a file is selected
            !isHashing; // Ensure hashing is completed
        setIsFormValid(isValid);
    }, [customFormData, uploadedFile, isHashing]); // This effect depends on these values

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCustomFormData((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handlePublicChange = (e) => {
        const checked = e.target.checked;
        setPublicDocument(checked);
        setCustomFormData((prevState) => ({
            ...prevState,
            publicFlag: checked,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // set loading after submitting document upload
        setLoading(true);

        if (isFormValid && !isHashing) {
            // Only proceed if hashing is done
            const formData = new FormData();
            formData.append('files', uploadedFile);
            formData.append('customFormData', JSON.stringify(customFormData)); // This now includes the hash
            // Proceed with the upload...
            for (let [key, value] of formData.entries()) {
                console.log(`${key}:`, value);
            }
            try {
                const response = await uploadDocument(formData);
                console.log('response from file upload axios post: ', response);
                setLoading(false);
                setUploadComplete(true);
                // navigate('/documents');

                // handle errors (error modal)
            } catch (err) {
                if (err.isAuthError) {
                    // Redirect to login page
                    navigate('/login-user');
                } else if (err.response) {
                    // Other errors
                    console.error(`Error ${err.response.status}: ${err.response.statusText}`);
                    setLoading(false);
                    setErrorMessage(err.response.data.error);
                    setShowErrorModal(true);
                } else {
                    console.log('Error', err.message);
                }
            }
        }

        //redirect to documents page
    };

    // const onUpload = (newDocument) => {
    //     setDocuments([...documents, newDocument]);
    // };

    const onDelete = () => {
        setUploadedFile(null);
    };

    // const handleFileChange = (event) => {
    //     processFile(event.target.files[0]);
    // };

    const handleFileChange = async (file) => {
        if (file) {
            setIsHashing(true); // Indicate that hashing has started
            const arrayBuffer = await file.arrayBuffer();
            const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
            console.log('SHA-256 Hash:', hashHex);

            setUploadedFile(file); // Store the file
            setCustomFormData((prevState) => ({
                ...prevState,
                hash: hashHex, // Include the hash in the form data
            }));
            setIsHashing(false); // Hashing complete
        }
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

    // set to only handle single file
    const processFile = (file) => {
        if (file) {
            console.log('file inside processFile: ', file);
            setUploadedFile(file); // Add new file to the array
            handleFileChange(file);
        }
    };

    const openFileDialog = () => {
        document.getElementById('hiddenFileInput').click();
    };

    // const handlePublicChange = (e) => {
    //     const { checked } = e.target;
    //     setPublicDocument(checked); // Update the publicDocument state

    //     // Update customFormData state to reflect the new state of the publicDocument checkbox
    //     setCustomFormData(
    //         (prevState) => ({
    //             ...prevState,
    //             public: checked,
    //         }),
    //         validateForm
    //     ); // Call validateForm directly here if needed

    //     validateForm(); // Explicitly call validateForm to ensure the form is validated with the latest state
    // };

    return (
        <Container className="pageContainer">
            <UploadDocumentContainer>
                {!uploadComplete ? (
                    <>
                        <UploadDragBox
                            $isDragActive={isDragActive}
                            onClick={openFileDialog}
                            onDrop={onDrop}
                            onDragOver={handleDragOver}
                            onDragEnter={() => setIsDragActive(true)}
                            onDragLeave={() => setIsDragActive(false)}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                                />
                            </svg>
                            Drag and drop a file here, or click to select a file
                            <HiddenUploadInput id="hiddenFileInput" type="file" onChange={(e) => processFile(e.target.files[0])} />
                        </UploadDragBox>
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
                                        <textarea name="description" value={customFormData.description} onChange={handleChange} />
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
                                    <PublicDocumentInput>
                                        <label>Public Document:</label>
                                        <input
                                            style={{ width: '50px' }}
                                            type="checkbox"
                                            checked={publicDocument}
                                            onChange={handlePublicChange}
                                        />
                                    </PublicDocumentInput>
                                    <SubmitFormButtonContainer>
                                        <button type="submit" disabled={!isFormValid} className="buttonPop">
                                            Submit
                                        </button>
                                    </SubmitFormButtonContainer>
                                </DocumentForm>
                            </UploadFileBox>
                        )}
                    </>
                ) : (
                    <UploadComplete>
                        <h6>File upload successful!</h6>
                        <button className="buttonPop" onClick={() => navigate('/documents')}>
                            View document
                        </button>
                    </UploadComplete>
                )}

                {loading && (
                    <LoadingComponent>
                        <h6>Uploading Document...</h6>
                        <LoadingIcon />
                    </LoadingComponent>
                )}

                {showErrorModal && <ErrorModal message={errorMessage} onClose={() => setShowErrorModal(false)} />}
            </UploadDocumentContainer>
        </Container>
    );
};

export default UploadDocumentComponent;
