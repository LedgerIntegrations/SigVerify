import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { fetchDocuments } from '../../../../utils/httpRequests/routes/documents';
import DocumentDetailsModal from './DocumentDetailsModal';
import { Link } from 'react-router-dom';

const OutterDocumentsContainer = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: start;
    width: 100%;
    padding: 0px 00px;
    z-index: 10;
`;

const DocumentUploadButton = styled(Link)`
    background-color: #57a9f1;
    color: white;
    position: fixed;
    bottom: 30px;
    right: 30px;
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
    padding: 20px 5vw;

    h1 {
        font-size: 1.5em;
        margin-bottom: 0px;
        margin-top: 4vh;
    }
`;

const DocumentDisplaySection = styled.section`
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
`;

const DocumentListHeader = styled.div`
    padding: 0px 6px;
    margin-bottom: 10px;
    display: flex;
    justify-content: space-between;

    & > * {
        width: 20%;
        text-decoration: underline;
    }
`;

const DocumentsList = styled.ul`
    width: 100%;
    max-width: 600px;
    background-color: white;
    padding: 20px 3vw;
    margin-top: 0px;
    list-style: none;
    border: none;
    border-radius: 10px 10px 10px 10px;
    min-height: 200px;
    overflow-y: auto;
    box-shadow: inset 2px 1px 4px 0px rgba(59, 59, 59, 0.5), 7px 7px 20px 0px rgba(0, 0, 0, 0.1),
        0px 0px 0px 0px rgba(0, 0, 0, 0.1);

    h3 {
        margin-left: 10px;
    }
`;

const DocumentListItem = styled.li`
    cursor: pointer;
    border: none;
    background-color: #ffffff;
    border: 0.5px solid #c1c1c1;
    padding: 6px 2px;
    margin-block: 3px;
    border-radius: 3px;
    font-size: 80%;
    box-shadow: inset 2px 2px 2px 0px rgba(255, 255, 255, 0.5), 7px 7px 20px 0px rgba(0, 0, 0, 0.1),
        2px 2px 2px 0px rgba(0, 0, 0, 0.1);

    &:hover {
        box-shadow: inset 2px 2px 2px 1px rgba(59, 59, 59, 0.5), 7px 7px 20px 0px rgba(0, 0, 0, 0.1),
            0px 0px 0px 0px rgba(0, 0, 0, 0.1);
    }
`;

const DocumentListItemContents = styled.div`
    display: flex;
    justify-content: space-between;
    padding: 0px 4px;

    & > * {
        width: 20%;
    }
`;

function DocumentsPage() {
    const [documents, setDocuments] = useState([]);
    const [selectedDocument, setSelectedDocument] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);

    useEffect(() => {
        console.log('DOCUMENTS PAGE USEEFFECT FIRING!');
        // Fetch documents from the server
        const fetchAllDocuments = async () => {
            try {
                const response = await fetchDocuments();
                setDocuments(response.data);
                console.log(response.data);
            } catch (error) {
                console.error('Error fetching documents:', error);
            }
        };
        fetchAllDocuments();
    }, []);

    const handleDocumentClick = (document) => {
        setSelectedDocument(document);
        setModalOpen(true);
    };

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
            <DocumentDisplaySection>
                <DocumentsList>
                    <DocumentListHeader>
                        <span>Name</span>
                        <span>Sharing</span>
                        <span>Category</span>
                        <span>Status</span>
                    </DocumentListHeader>
                    {!documents || documents.length === 0 ? (
                        <p>No documents available.</p>
                    ) : (
                        documents.map((document) => (
                            <DocumentListItem key={document.id} onClick={() => handleDocumentClick(document)}>
                                <DocumentListItemContents>
                                    <strong>{document.title}</strong>
                                    <span style={{ color: '#777' }}>{document.role}</span>
                                    <span style={{ color: '#777' }}>{document.category}</span>
                                    <span style={{ color: 'orange' }}>
                                        {document.is_signed ? 'Completed' : 'Pending'}
                                    </span>
                                </DocumentListItemContents>
                            </DocumentListItem>
                        ))
                    )}
                </DocumentsList>
            </DocumentDisplaySection>

            {modalOpen && <DocumentDetailsModal cid={selectedDocument.ipfs_hash} onClose={() => setModalOpen(false)} />}
        </OutterDocumentsContainer>
    );
}

export default DocumentsPage;
