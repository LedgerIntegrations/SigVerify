import React, { useState } from 'react';
import styled from 'styled-components';
import DocViewer, { DocViewerRenderers } from '@cyntler/react-doc-viewer';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Container = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-inline: 30px;
`;

const UploadDocumentContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
`;

const UploadDragBox = styled.div`
    margin-bottom: 20px;
    margin-top: 75px;
    border: 2px dashed ${(props) => (props.$isDragActive ? 'blue' : '#ccc')};
    height: 200px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    text-align: center;
    width: 95%;
    max-width: 375px;
    border-radius: 20px;
    padding-inline: 40px;
`;

const HiddenUploadInput = styled.input`
    display: none;
`;

const ButtonsContainer = styled.div`
    display: flex;
    justify-content: space-between; // Aligns items on both ends
    align-items: center; // Vertically centers the buttons
    width: 95%;
    max-width: 500px;
    margin-bottom: 20px;
`;

const UploadButton = styled.button`
    margin-right: auto; // Pushes the button to the center
    margin-left: auto; // Centers the button
    display: block;
    width: 80%;
    max-width: 300px;
    padding: 12px;
    margin-inline: auto;
    background-color: #424141;
    color: #fff;
    border: none;
    border-radius: 20px;
    cursor: pointer;
    font-size: 16px;
    transition: background-color 0.3s;

    &:hover {
        background-color: #000000;
    }
`;

const DeleteButton = styled.button`
    background-color: red;
    color: white;
    border: none;
    border-radius: 3px;
    position: absolute;
    top: 485px;
    margin-left: 8px;
    z-index: 20;
    opacity: 0.8;
    font-size: 12px;
    padding-block: 3px;
    padding-inline: 10px;

    &:hover {
        background-color: darkred; // Darker shade on hover
        color: #fff; // Change text color if needed
        cursor: pointer; // Change cursor to indicate it's clickable
        // Add more styles as per your design requirement
    }
`;

const MyDocViewer = styled(DocViewer)`
    border-radius: 10px;
    max-width: 500px;
`;

const UploadDocumentComponent = () => {
    const [isDragActive, setIsDragActive] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState([]); // array of temp uploaded files
    const [documents, setDocuments] = useState([]); // This will hold all documents

    const navigate = useNavigate();

    const onUpload = (newDocument) => {
        setDocuments([...documents, newDocument]);
    };

    const onDelete = (docName) => {
        setDocuments((prevDocs) => prevDocs.filter((doc) => doc.name !== docName));
    };

    const onUploadComplete = () => {
        setDocuments([]);
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
            setUploadedFiles((prevFiles) => [...prevFiles, file]); // Add new file to the array
            onUpload({ name: file.name, isSigned: false });
        }
    };

    const openFileDialog = () => {
        document.getElementById('hiddenFileInput').click();
    };

    const handleUploadSubmit = async () => {
        const formData = new FormData();
        uploadedFiles.forEach((file) => {
            formData.append('files', file);
        });

        for (let [key, value] of formData.entries()) {
            console.log(`${key}:`, value);
        }

        try {
            const userEmail = JSON.parse(window.sessionStorage.getItem('accountObject'))?.email;
            console.log('users email: ', userEmail);

            formData.append('userEmail', userEmail);

            const response = await fetch('http://localhost:3001/api/document/upload', {
                method: 'POST',
                body: formData,
            });
            if (!response.ok) {
                console.error(`Error ${response.status}: ${response.statusText}`);
                return;
            }
            const result = await response.json();
            console.log('response from file upload axios post: ', result);
        } catch (err) {
            console.log(err);
        }

        onUploadComplete();
        setUploadedFiles([]);
        navigate('/documents');
    };

    const handleDocumentDelete = () => {
        const currentDocElement = document.getElementById('file-name');
        if (!currentDocElement) return;

        const currentDocName = currentDocElement.textContent;
        if (!currentDocName) return;

        onDelete(currentDocName); // Call the passed delete function
        setUploadedFiles((prevFiles) => prevFiles.filter((file) => file.name !== currentDocName));
    };

    return (
        <Container className="pageContainer">
            <UploadDocumentContainer>
                <UploadDragBox
                    $isDragActive={isDragActive}
                    onClick={openFileDialog}
                    onDrop={onDrop}
                    onDragOver={handleDragOver}
                    onDragEnter={(e) => setIsDragActive(true)}
                    onDragLeave={(e) => setIsDragActive(false)}
                >
                    Drag and drop a file here, or click to select a file
                    <HiddenUploadInput id="hiddenFileInput" type="file" onChange={handleFileChange} />
                </UploadDragBox>
                {uploadedFiles.length > 0 && (
                    <>
                        <ButtonsContainer>
                            <DeleteButton onClick={handleDocumentDelete}>Delete</DeleteButton>
                            <UploadButton onClick={handleUploadSubmit}>Upload</UploadButton>
                        </ButtonsContainer>
                        {/* need to fix warning when clicking #doc-nav-next */}
                        {/* styled-components: it looks like an unknown prop "last" is being sent through to the DOM */}
                        <MyDocViewer
                            documents={uploadedFiles.map((file) => ({
                                uri: window.URL.createObjectURL(file),
                                fileName: file.name,
                            }))}
                            pluginRenderers={DocViewerRenderers}
                            last="true"
                        />
                    </>
                )}
            </UploadDocumentContainer>
        </Container>
    );
};

export default UploadDocumentComponent;
