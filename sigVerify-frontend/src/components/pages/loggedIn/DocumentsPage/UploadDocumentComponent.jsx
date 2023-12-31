import { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { createDocument } from '../../../../utils/httpRequests/document';

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
        text-align: start;
        display: flex;
        align-items: start;
        gap: 15px;
        margin-bottom: 10px;
        label {
            min-width: 100px;
        }

        select {
            font-size: 14px;
        }
    }

    button {
        margin-top: 10px;
        padding: 6px 15px;
        border-radius: 10px;
        font-size: 14px;
        border: 1px solid black;
    }
`;

const UploadDocumentComponent = () => {
    const navigate = useNavigate();

    const [customFormData, setCustomFormData] = useState({
        title: '',
        description: '',
        category: '',
    });
    const [isDragActive, setIsDragActive] = useState(false);
    const [uploadedFile, setUploadedFile] = useState(null); // array of temp uploaded files
    const [documents, setDocuments] = useState([]); // This will hold all documents

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCustomFormData((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('files', uploadedFile);
        formData.append('customFormData', JSON.stringify(customFormData));
        for (let [key, value] of formData.entries()) {
            console.log(`${key}:`, value);
        }

        try {
            const response = await createDocument(formData);
            console.log('response from file upload axios post: ', response.data);
            navigate('/documents');
        } catch (err) {
            if (err.isAuthError) {
                // Redirect to login page
                navigate('/login-user');
            } else if (err.response) {
                // Other errors
                console.error(`Error ${err.response.status}: ${err.response.statusText}`);
            } else {
                console.log('Error', err.message);
            }
        }

        //redirect to documents page
    };

    const onUpload = (newDocument) => {
        setDocuments([...documents, newDocument]);
    };

    const onDelete = () => {
        // setDocuments((prevDocs) => prevDocs.filter((doc) => doc.name !== docName));
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
            // setUploadedFiles((prevFiles) => [...prevFiles, file]); // Add new file to the array
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

                {uploadedFile && (
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
                            <button type="submit" className="buttonPop">
                                Submit
                            </button>
                        </DocumentForm>
                    </UploadFileBox>
                )}
            </UploadDocumentContainer>
        </Container>
    );
};

export default UploadDocumentComponent;
