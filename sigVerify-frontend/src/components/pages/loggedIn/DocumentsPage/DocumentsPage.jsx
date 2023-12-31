import { useContext, useState, useEffect } from 'react';
import styled from 'styled-components';
import DocumentListFilter from './DocumentListFilter';
import { AccountContext } from '../../../../App';
import { Link } from 'react-router-dom';

const OutterDocumentsContainer = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: start;
    width: 100%;
    padding: 0px 10px;
    z-index: 10;
`;

const DocumentUploadButton = styled(Link)`
    background-color: #57a9f1;
    color: white;
    position: fixed;
    bottom: 50px;
    right: 50px;
    padding: 10px;
    border: 1px solid white;
    border-radius: 50%;
    svg {
        height: 30px;
        width: 30px;
    }
`;

const DocumentsHeader = styled.div`
    width: 100%;
    max-width: 600px;
    padding-inline: 20px;

    h1 {
        font-size: 1.5em;
        margin-bottom: 0px;
        margin-top: 4vh;
    }
`;

const DocumentSection = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    padding: 15px;
    width: 100%;
    max-width: 600px;
    margin-top: 14px;
    box-shadow: inset 2px 2px 2px 0px rgba(255, 255, 255, 0.5), inset 7px 7px 20px 0px rgba(0, 0, 0, 0.1),
        inset 4px 4px 5px 0px rgba(0, 0, 0, 0.1);
    border-radius: 10px;
    margin-bottom: 10vh;
`;

const DocumentDisplay = styled.div`
    width: 100%;
    max-width: 600px;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-around;
    gap: 10px;
    padding: 16px;
    background-color: white;
    border-radius: 10px;

    div {
    }
`;


const NoDocumentsMessage = styled.p`
    font-size: 14px;
`;

function DocumentsPage() {
    // eslint-disable-next-line no-unused-vars
    const [accountObject, setAccountObject] = useContext(AccountContext);
    const [documents, setDocuments] = useState([]);

    async function convertSignedUrlToJsFileObject(url, filename) {
        const response = await fetch(url);
        const blob = await response.blob();
        return new File([blob], filename, {
            type: blob.type === 'application/octet-stream' ? 'text/plain' : blob.type,
        });
    }

    // Function to handle document deletion
    const handleDelete = async (documentId) => {
        // try {
        //     const response = await fetch('http://localhost:3001/api/document/delete', {
        //         method: 'POST',
        //         headers: {
        //             'Content-Type': 'application/json',
        //         },
        //         body: JSON.stringify({ document_id: documentId }),
        //         credentials: 'include',
        //     });

        //     if (!response.ok) {
        //         throw new Error('Error deleting document');
        //     }

        //     // Remove the deleted document from the state
        //     setDocuments(documents.filter((doc) => doc.document_id !== documentId));
        // } catch (error) {
        //     console.error('Error deleting document:', error);
      // }

      console.log("handle delete function documentId: ",documentId)
    };

    // Function to handle document viewing
    const handleView = (document) => {
        // Logic to view the document
        // Similar to handleDocumentClick in DocumentListFilter
    };

  const prepareDocument = (document) => {
      console.log("document item inside prepare document function: ", document)
    };

    useEffect(() => {
        const fetchDocuments = async () => {
            try {
                const response = await fetch('http://localhost:3001/api/documents', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include', // This is necessary to include cookies
                });

                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }

                const data = await response.json();
                console.log('response from /getAllDocuments endpoint in useEffect: ', data);
                if (!Array.isArray(data)) {
                    setDocuments([]);
                    return;
                }
                const formattedUserDocuments = data.map(async (document) => {
                    const convertedDocument = await {
                        ...document,
                        File: await convertSignedUrlToJsFileObject(document.signedUrl, document.name),
                    };
                    return convertedDocument;
                });

                const resolvedFormattedUserDocuments = await Promise.all(formattedUserDocuments);

                console.log(
                    'formattedUserDocuments to add JS File object into each file...',
                    resolvedFormattedUserDocuments
                );
                setDocuments(resolvedFormattedUserDocuments);
            } catch (error) {
                console.error('Error fetching documents:', error);
            }
        };

        fetchDocuments();
    }, []); // Dependency array empty if you only want to run this once after the component mounts

    return (
        <OutterDocumentsContainer>
            <DocumentsHeader>
                <h1>Documents</h1>
                <p>View all documents, filter by category.</p>
            </DocumentsHeader>

            <DocumentUploadButton to="/upload" className="buttonPop">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
            </DocumentUploadButton>

            <DocumentSection>
                <DocumentDisplay>
                    {documents.length === 0 && (
                        <NoDocumentsMessage>No documents found for this user.</NoDocumentsMessage>
                    )}
                    {documents.length > 0 && (
                        <DocumentListFilter
                            documents={documents}
                            options={['all documents', 'signed documents', 'unsigned documents']}
                        />
                    )}
                </DocumentDisplay>
            </DocumentSection>
            {/* <DocumentsList>
                {documents.map((item, index) => (
                    <li key={index}>
                        <strong>{item.title}</strong>
                        <div>
                            <button onClick={() => handleDelete(item.document_id)}>Delete</button>
                            <button onClick={() => handleView(item)}>View</button>
                            <button onClick={() => prepareDocument(item)}>Prep</button>
                        </div>
                    </li>
                ))}
            </DocumentsList> */}
        </OutterDocumentsContainer>
    );
}

export default DocumentsPage;
