import { useState, useEffect, useContext } from 'react';
import styled from 'styled-components';
import { FaFileSignature } from 'react-icons/fa';
import { CiStar } from 'react-icons/ci';
import { fetchDocuments } from '../../../../utils/httpRequests/routes/documents';
import DocumentDetailsModal from './DocumentDetailsModal';
import { Link } from 'react-router-dom';
import { AccountContext } from '../../../../App';
import { useAxios } from '../../../../utils/httpRequests/AxiosContext';

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
    max-width: 800px;
    display: flex;
    /* flex-direction: column; */
    /* flex-wrap: wrap; */
    overflow: auto;
    justify-content: start;
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
    min-width: 320px;
    max-width: 400px;
    /* background-color: white; */
    padding: 20px 2vw;
    margin-top: 0px;
    list-style: none;
    border: none;
    border-radius: 10px 10px 10px 10px;
    min-height: 200px;
    overflow-y: auto;
    /* box-shadow: inset 2px 1px 4px 0px rgba(59, 59, 59, 0.5), 7px 7px 20px 0px rgba(0, 0, 0, 0.1),
        0px 0px 0px 0px rgba(0, 0, 0, 0.1); */

    h3 {
        margin-left: 10px;
    }
`;

const DocumentListItem = styled.li`
    cursor: pointer;
    background-color: ${(props) => (props.isActive ? '#e4f0fee6' : '#ffffff')};
    border: ${(props) => (props.isActive ? '1px solid #6fa2fa' : '0.5px solid #c1c1c1')};
    margin-block: 3px;
    border-radius: 10px;
    font-size: 80%;
    box-shadow: inset 2px 2px 2px 0px rgba(255, 255, 255, 0.5), 7px 7px 20px 0px rgba(0, 0, 0, 0.1),
        2px 2px 2px 0px rgba(0, 0, 0, 0.1);

    .dropdown-content {
        display: none;
        padding: 10px;
        // Styling for the hidden content
    }

    .dropdown-content.show {
        display: block;
        // Additional styling when content is shown
    }
`;

const DocumentListItemContents = styled.div`
    display: flex;
    flex-direction: column;
    padding: 13px;
    border-bottom: 0.5px solid #c1c1c1;

    .main-title {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0px 4px;

        h3 {
            margin-left: 0px;
            margin-top: 7px;
            margin-bottom: 10px;
        }

        div {
            display: flex;
            gap: 10px;
        }
    }

    .main-content {
        display: flex;
        justify-content: space-between;
        padding: 0px 7px;

        svg {
            padding: 5px 0px;
            margin-left: 5px;
            height: 50%;
            width: 100%;
            min-width: 60px;

            path {
            }
        }

        #chunk1 {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 10px;
        }

        #senderAndReciever {
          display: flex;
          flex-direction: column;
        }

    }

    .see-more {
        color: #57a9f1;
        cursor: pointer;
        margin-top: 5px;
        text-align: start;
        padding: 0px 5px;
        width: fit-content;
    }
`;

const SignatureIconContainer = styled.div`
    background-color: #efefef;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 50px;
    max-width: 50px;
    border-radius: 50%;
`;

const StyledSignatureIcon = styled(FaFileSignature)`
    /* height: 26px;
    width: 24px; */
`;

const formatDate = (dateString) => {
    const date = new Date(dateString);
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // getMonth() returns 0-11
    const year = date.getFullYear().toString().slice(2);
    return `${month}.${year}`;
};

function DocumentsPage() {
    const [accountObject, setAccountObject] = useContext(AccountContext);

    const [documents, setDocuments] = useState([]);
    const [selectedDocument, setSelectedDocument] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [openedDocumentId, setOpenedDocumentId] = useState(null);
    const [activeId, setActiveId] = useState(null);

    const axios = useAxios();

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

    const toggleDropdown = (event, documentId) => {
        event.stopPropagation(); // Prevent click from bubbling up
        if (openedDocumentId === documentId) {
            setOpenedDocumentId(null);
        } else {
            setOpenedDocumentId(documentId);
        }
    };

    const handleDocumentClick = (document) => {
        setSelectedDocument(document);
        setModalOpen(true);
        setActiveId(document.id); // Set the active document ID
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
                    {documents.map((document) => (
                        <DocumentListItem
                            key={document.id} // Assuming each document has a unique ID
                            isActive={activeId === document.id}
                            onClick={() => handleDocumentClick(document)}
                        >
                            {' '}
                            <DocumentListItemContents>
                                <div className="main-title">
                                    <h3>{document.title}</h3>
                                    <div>
                                        <strong>{formatDate(document.created_at)}</strong>
                                        <CiStar />
                                    </div>
                                </div>
                                <div className="main-content">
                                    {/* Main content of each document */}
                                    <div id="chunk1">
                                        <SignatureIconContainer>
                                            <StyledSignatureIcon />
                                        </SignatureIconContainer>
                                        <div id="senderAndReciever">
                                            <strong>Creator: {document.title}</strong> {/* Title */}
                                            <span style={{ color: '#777' }}>To: {document.role}</span> {/* User's Role */}
                                        </div>
                                    </div>

                                    <span style={{ color: 'orange' }}>
                                        {document.required_signers_wallets.length > 0 &&
                                        document.missing_signatures.length === 0
                                            ? 'Complete'
                                            : document.missing_signatures.length <
                                              document.required_signers_wallets.length
                                            ? 'Partial'
                                            : 'Pending'}
                                    </span>
                                    {/* Status */}
                                </div>
                                <div className="see-more" onClick={(e) => toggleDropdown(e, document.id)}>
                                    {openedDocumentId === document.id ? 'See Less' : 'See More'}
                                </div>
                            </DocumentListItemContents>
                            <div className={`dropdown-content ${openedDocumentId === document.id ? 'show' : ''}`}>
                                {/* Additional details in dropdown */}
                                <p>
                                    Description: <em>{document.description}</em>
                                </p>
                                <p>
                                    Category: <em>{document.category}</em>
                                </p>
                                <p>
                                    Document Type: <em>{document.document_type}</em>
                                </p>
                                <p>
                                    Document Size: <em>{document.document_size}</em>
                                </p>
                                <p>
                                    Encrypted: <em>{document.encrypted ? 'Yes' : 'No'}</em>
                                </p>
                                <p>
                                    Expires At: <em>{document.expires_at || 'N/A'}</em>
                                </p>
                                <p>
                                    Created At: <em>{new Date(document.created_at).toLocaleString()}</em>
                                </p>
                                <p>
                                    Updated At: <em>{new Date(document.updated_at).toLocaleString()}</em>
                                </p>
                                <p>
                                    IPFS Hash: <em>{document.ipfs_hash}</em>
                                </p>
                                <p>
                                    Required Signers: <em>{document.required_signers_wallets.join(', ')}</em>
                                </p>
                                <p>
                                    XRPL Transaction Hashes:{' '}
                                    <em>
                                        {document.xrpl_tx_hashes.length > 0
                                            ? document.xrpl_tx_hashes.join(', ')
                                            : 'None'}
                                    </em>
                                </p>
                            </div>
                        </DocumentListItem>
                    ))}
                </DocumentsList>
            </DocumentDisplaySection>

            {modalOpen && (
                <DocumentDetailsModal
                    dbDocData={selectedDocument}
                    userHashedEmail={accountObject.emailHash}
                    onClose={() => setModalOpen(false)}
                />
            )}
        </OutterDocumentsContainer>
    );
}

export default DocumentsPage;
