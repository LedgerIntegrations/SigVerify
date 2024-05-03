import { useState } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import AddDocumentAccess from './AddDocumentAccess';
import { MdExpandMore, MdExpandLess } from 'react-icons/md';
import { disableDocumentAccess, deleteDocumentAccessEntry } from '../../../../../utils/httpRequests/routes/documents';
import { FaTrashAlt } from 'react-icons/fa';
import { CiEdit } from 'react-icons/ci';
import { RiUserReceivedLine } from 'react-icons/ri';
import { BsSend } from 'react-icons/bs';
import { BsUnlock } from 'react-icons/bs';
import { FiBookOpen } from 'react-icons/fi';
import { CiCircleCheck } from 'react-icons/ci';

const DocumentDisplay = styled.section`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: start;
    text-align: start;
    width: 100%;
    padding: 0px 0px;
    margin-bottom: 10px;
    z-index: 10;
`;

const DocumentsList = styled.ul`
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    padding-left: 0px;
    margin-block: 0px;
    list-style: none;
    border: none;
    border-radius: 10px 10px 10px 10px;
    overflow-y: auto;
`;

const Document = styled.article`
    background-color: ${(props) => (props.isActive ? '#e4f0fee6' : '#ffffff')};
    border: ${(props) => (props.isActive ? '1px solid #6fa2fa' : '0.5px solid #c1c1c1')};
    display: flex;
    width: 100%;
    padding: 0px;
    flex-direction: column;
    align-items: start;
    justify-content: space-between;
    margin: 3px;
    border-radius: 10px;
    font-size: 0.65em;
    box-shadow: inset 2px 2px 2px 0px rgba(255, 255, 255, 0.5), 7px 7px 20px 0px rgba(0, 0, 0, 0.1), 2px 2px 2px 0px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    overflow-y: auto;
`;

const DocumentContents = styled.div`
    display: flex;
    flex-direction: column;
    padding: 10px;
    width: 100%;
    align-items: flex-start;

    .document-card-title {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        padding: 0px 4px;
        width: 100%;

        #uploadDate {
            margin-inline: 5px;
            font-size: 1.3em;
        }

        h4 {
            margin-left: 7px;
            margin-top: 0px;
            margin-bottom: 1px;
            color: #363636;
            font-family: 'Saira', sans-serif;
            font-weight: 400;
            text-decoration: underline;
            font-size: 1.5em;
            letter-spacing: 0.1px;
        }

        div {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 3px;

            span {
                color: #7070708a;
            }
        }

        @media (max-width: 520px) {
            font-size: 0.85em;
        }
    }

    .main-content {
        padding: 0px 10px;
        padding-left: 10px;
        margin-inline: auto;
        margin-top: 10px;
        margin-left: 12px;
        width: 90%;

        @media (max-width: 520px) {
            padding: 0 5px;
        }

        section {
            strong {
                font-weight: 400;
                color: #373737;
                font-family: 'Saira', sans-serif;
                width: 100px;
                margin-right: 2px;
            }
            em {
                color: #787878;
                font-style: normal;
            }
        }
        .metadata-section {
            display: flex;
            flex-direction: column;
        }

        .metadata-content {
            font-size: 0.95em;
            padding-block: 5px;

            section {
                margin-block: 0px;
                padding-left: 12px;

                strong {
                    font-weight: 300;
                }

                em {
                    color: #2b2b2b;
                    font-size: 0.9em;
                    font-style: normal;
                }
            }
        }

        .recipients-section {
            display: flex;
            flex-direction: column;
        }

        .recipient-content {
            margin-top: 0px;
            font-size: 0.9em;
            padding-inline-start: 24px;
            margin-bottom: 5px;

            li {
                font-size: 1em;
                margin-top: 0px;
            }

            ::marker {
                color: #787878;
            }
        }
    }
`;

const DocumentDetailsContent = styled.div`
    display: grid;
    gap: 1.5px 0px;

    @media (min-width: 520px) {
        grid-template-columns: repeat(2, 1fr);
        gap: 3px;
        font-size: 1.15em;
        margin-left: 16px;
    }
    @media (max-width: 519px) {
        grid-template-columns: 1fr;
        gap: 1px;
        margin-left: 8px;
    }
`;

const SignatureIconContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 26px;
    width: 26px;
    border-radius: 50%;
    margin-left: 0px;
    color: white;
    box-shadow: inset 2px 2px 2px 1px rgba(59, 59, 59, 0.5), 7px 7px 20px 0px rgba(0, 0, 0, 0.1);
    background-color: ${(props) => props.$bgColor || '#888'};

    svg {
        stroke-width: 1.1;
        border: none;
    }
`;

const TrashButton = styled.button`
    width: 17px;
    padding: 3px;
    background-color: #f06868;
    border-radius: 5px;
    color: white;
    cursor: pointer;
    border: none;
    margin-left: 5px;

    &:hover {
        background-color: red;
    }

    svg {
        transform: scale(0.75);
        position: relative;
        right: 1px;
        font-size: 13px;
    }
`;

const RotatableIcon = styled(MdExpandMore)`
    height: 24px;
    width: 24px;
    background-color: transparent;
    color: #8b8b8b !important;
    border: 0.5px solid #d6d6d6;
    border-radius: 50%;
    transform: ${({ isopen }) => (isopen ? 'rotate(0deg)' : 'rotate(180deg)')};
    transition: transform 0.2s;
    box-shadow: inset 0.5px 0.5px 1px 0px rgb(35, 35, 35);
    position: relative;
`;

const RecipientToggleBox = styled.div`
    display: flex;
    align-items: start;
    margin-top: 2.5px;
    color: #373737;
    font-family: 'Saira', sans-serif;

    strong {
        font-weight: 500;
    }
`;

const RecipientsToggle = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    margin-top: 0px;

    svg {
        position: relative;
        bottom: 1px;
        margin-left: 2px;
        color: #111;
    }
`;

const DocumentActionButtons = styled.div`
    display: flex;
    justify-content: start;
    align-items: center;
    flex-wrap: wrap;
    gap: 5px;
    padding-bottom: 3px;
    padding-top: 12px;
    width: 100%;
    font-size: 10px;
    margin-top: 0px;

    @media (min-width: 446px) {
        margin-top: 0px;
        font-size: 11px;
    }

    button {
        min-width: 83px;
        padding: 5px 10px;
        padding-top: 6px;
        margin-right: 0px;
        border-radius: 5px;
        border: none;
        cursor: pointer;
        background-color: #007bff;
        color: white;

        &:disabled {
            background-color: #cccccc;
            cursor: not-allowed;
        }
    }

    #signButton {
        background-color: #3479e9;

        &:hover {
            background-color: #265eb8;
        }
    }

    #addAccessButton {
        background-color: #f0b400;

        &:hover {
            background-color: #e1a901;
        }
    }

    #finalizeButton {
        background-color: #f48414;

        &:hover {
            background-color: #d37312;
        }
    }
`;

const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString().slice(2);
    return `${day}.${month}.${year}`;
};

function getIcon(displayCategory) {
    switch (displayCategory) {
        case 'public':
            return {
                icon: (
                    <FiBookOpen
                        style={{ strokeWidth: '2px', height: '15px', width: '15px', position: 'relative', top: '1px', left: '.5px' }}
                    />
                ),
                color: '#43c3ea',
            }; // Green
        case 'uploaded':
            return { icon: <CiEdit style={{ strokeWidth: '1px', height: '15px', width: '15px' }} />, color: '#FFC107' };
        case 'received':
            return { icon: <RiUserReceivedLine style={{ strokeWidth: '1px', height: '13px', width: '13px' }} />, color: '#f64c21' };
        case 'sent':
            return { icon: <BsSend style={{ strokeWidth: '1px', height: '13px', width: '13px' }} />, color: '#f48414' };
        case 'completed':
            return { icon: <CiCircleCheck style={{ strokeWidth: '2px', height: '17px', width: '17px' }} />, color: '#40bf4a' };
        default:
            return { icon: <BsUnlock />, color: '#9E9E9E' };
    }
}

// eslint-disable-next-line react/prop-types
function IconDisplay({ displayCategory }) {
    const { icon, color } = getIcon(displayCategory);
    return <SignatureIconContainer $bgColor={color}>{icon}</SignatureIconContainer>;
}

// eslint-disable-next-line react/prop-types
function DocumentsDisplay({ arrayOfDocuments = [], viewerAccountId = null, displayCategory, deleteDocument, setRefreshTrigger = null }) {
    console.log('array of given documents: ', arrayOfDocuments);
    const [currentDocumentId, setCurrentDocumentId] = useState(null);
    const [isAccessModalOpen, setIsAccessModalOpen] = useState(false);
    const [contentDropdownOpen, setContentDropdownOpen] = useState({});

    const [recipientsDropdownOpen, setRecipientsDropdownOpen] = useState({});
    const [metadataDropdownOpen, setMetadataDropdownOpen] = useState({});

    const handleAddAccess = (documentId) => {
        setCurrentDocumentId(documentId);
        setIsAccessModalOpen(!isAccessModalOpen);
    };

    const onAccesAdded = () => {
        setIsAccessModalOpen(!isAccessModalOpen);
    };

    const finalizeDocumentAccess = async (documentId) => {
        try {
            await disableDocumentAccess(documentId);
            console.log('Document access finalized successfully.');
            // Optionally refresh the document list or document details to reflect the change
            setRefreshTrigger((prev) => !prev);
        } catch (error) {
            console.error('Failed to finalize document access:', error);
        }
    };

    const removeDocumentAccess = async (accessId) => {
        try {
            await deleteDocumentAccessEntry(accessId);
            console.log('Document access removed successfully.');
            // Refresh to reflect the change
            setRefreshTrigger((prev) => !prev);
        } catch (error) {
            console.error('Failed to remove document access:', error);
        }
    };

    const toggleRecipientsDropdown = (documentId) => {
        setRecipientsDropdownOpen((prevState) => ({
            ...prevState,
            [documentId]: !prevState[documentId],
        }));
    };

    const toggleMetadataDropdown = (documentId) => {
        setMetadataDropdownOpen((prevState) => ({
            ...prevState,
            [documentId]: !prevState[documentId],
        }));
    };

    const handleDelete = async (documentId) => {
        try {
            await deleteDocument(documentId);
            setRefreshTrigger((prev) => !prev); // Refresh the documents list
            alert('Document deleted successfully.');
        } catch (error) {
            alert(`Error deleting document: ${error.message}`);
        }
    };

    return (
        <DocumentDisplay>
            <DocumentsList>
                {arrayOfDocuments.map((document) => (
                    <Document key={document.id}>
                        <DocumentContents>
                            <header className="document-card-title">
                                <div>
                                    <RecipientsToggle
                                        onClick={() =>
                                            setContentDropdownOpen((prevState) => ({
                                                ...prevState,
                                                [document.id]: !prevState[document.id],
                                            }))
                                        }
                                    >
                                        <RotatableIcon isopen={contentDropdownOpen[document.id]} />{' '}
                                    </RecipientsToggle>
                                    <Link to={`/document/${document.id}`} style={{ textDecoration: 'none', color: 'white' }}>
                                        <h4>{document.blob?.filename}</h4>
                                    </Link>

                                    {displayCategory === 'upload' && (
                                        <TrashButton onClick={() => handleDelete(document.id)} className="buttonPop">
                                            <FaTrashAlt />
                                        </TrashButton>
                                    )}
                                </div>

                                {/* <span id="signatureStatus">{document.signatureStatus?.signatureStatus}</span> */}

                                <div>
                                    <span id="uploadDate">{formatDate(document.created_at)}</span>
                                    <IconDisplay displayCategory={displayCategory} />
                                    {/* <CiStar /> */}
                                </div>
                            </header>
                            {contentDropdownOpen[document.id] && (
                                <div className="main-content">
                                    <DocumentDetailsContent>
                                        <section>
                                            <strong>Uploader:</strong> <em>{document.uploader_email}</em>
                                        </section>
                                        <section>
                                            <strong>Public:</strong> <em>{document.public ? 'true' : 'false'}</em>
                                        </section>
                                        <section>
                                            <strong>Custom Title:</strong> <em>{document.blob ? document.title : document.title}</em>
                                        </section>
                                        <section>
                                            <strong>Category:</strong> <em>{document.category}</em>
                                        </section>
                                        <div className="metadata-section">
                                            <RecipientToggleBox>
                                                <strong>Metadata:</strong>
                                                <RecipientsToggle onClick={() => toggleMetadataDropdown(document.id)}>
                                                    {metadataDropdownOpen[document.id] ? <MdExpandMore /> : <MdExpandLess />}
                                                </RecipientsToggle>
                                            </RecipientToggleBox>
                                            {/* Conditionally render metadata details */}
                                            {metadataDropdownOpen[document.id] && (
                                                <div className="metadata-content">
                                                    <section>
                                                        <strong>Description: </strong>
                                                        <em>{document.description}</em>
                                                    </section>
                                                    {/*  Add additional metadata later if needed */}
                                                </div>
                                            )}
                                        </div>

                                        <div className="recipients-section">
                                            {document.accessObjects?.length > 0 && (
                                                <>
                                                    <RecipientToggleBox>
                                                        <strong>Recipients:</strong>
                                                        <RecipientsToggle onClick={() => toggleRecipientsDropdown(document.id)}>
                                                            {recipientsDropdownOpen[document.id] ? <MdExpandMore /> : <MdExpandLess />}
                                                        </RecipientsToggle>
                                                    </RecipientToggleBox>
                                                    {recipientsDropdownOpen[document.id] && (
                                                        <ol className="recipient-content">
                                                            {document.accessObjects.map((recipient) => (
                                                                <li key={recipient.id}>
                                                                    {recipient.email ? recipient.email : recipient.wallet_address}
                                                                    {document.can_add_access && (
                                                                        <TrashButton
                                                                            className="buttonPop"
                                                                            onClick={() => removeDocumentAccess(recipient.id, document.id)}
                                                                        >
                                                                            <FaTrashAlt />
                                                                        </TrashButton>
                                                                    )}
                                                                </li>
                                                            ))}
                                                        </ol>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </DocumentDetailsContent>

                                    <DocumentActionButtons>
                                        <Link to={`/document/${document.id}`} style={{ textDecoration: 'none', color: 'white' }}>
                                            <button id="signButton" className="buttonPop">
                                                View
                                            </button>
                                        </Link>
                                        {!document.public && document.can_add_access && document.user_profile_id === viewerAccountId && (
                                            <button id="addAccessButton" className="buttonPop" onClick={() => handleAddAccess(document.id)}>
                                                Add Access
                                            </button>
                                        )}
                                        {document.can_add_access && !document.public && (
                                            <button
                                                id="finalizeButton"
                                                className="buttonPop"
                                                onClick={() => finalizeDocumentAccess(document.id)}
                                            >
                                                Send
                                            </button>
                                        )}
                                    </DocumentActionButtons>
                                </div>
                            )}
                        </DocumentContents>
                    </Document>
                ))}
            </DocumentsList>
            {isAccessModalOpen && (
                <AddDocumentAccess
                    documentId={currentDocumentId}
                    onAccessAdded={() => {
                        onAccesAdded();
                        setRefreshTrigger((prev) => !prev);
                    }}
                />
            )}
        </DocumentDisplay>
    );
}

export default DocumentsDisplay;
