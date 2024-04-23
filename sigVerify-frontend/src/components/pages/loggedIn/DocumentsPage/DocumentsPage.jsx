import { useState, useEffect, useContext } from 'react';
import styled from 'styled-components';
import {
    fetchUserPrivateDocuments,
    fetchUserPublicDocumentsByEmail,
    deletePrivateUnsentDocument,
} from '../../../../utils/httpRequests/routes/documents';
import { getSignaturesStatusForDoc } from '../../../../utils/httpRequests/routes/signatures';
import DocumentsDisplay from './subComponents/DocumentDisplay';
import { Link } from 'react-router-dom';
import { MdExpandLess } from 'react-icons/md';
import { ErrorMessage } from '../../../component-helpers/styled-elements/CommonStyles';
import { AccountContext } from '../../../../App';

const OutterDocumentsContainer = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: start;
    width: 100%;
    max-width: 600px;
    padding: 12px;
    z-index: 10;
    /* font-family: 'Teko', sans-serif;
    font-weight: 400; */
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
    z-index: 1010;

    svg {
        height: 30px;
        width: 30px;
    }
`;

const DocumentSections = styled.div`
    width: 100%;
`;

const DocumentsHeader = styled.div`
    width: 100%;
    max-width: 600px;
    margin-bottom: 10px;

    h1 {
        font-size: 1.8em;
        margin-bottom: 0px;
        margin-top: 4vh;
        font-family: 'Saira', sans-serif;
        font-weight: 400;
    }
`;

const DocumentDisplaySection = styled.section`
    width: 100%;
    max-width: 600px;
    display: flex;
    flex-direction: column;
    justify-content: start;
    align-items: start;
`;

const CategoryHeader = styled.div`
    width: 100%;
    /* background-color: #ffffffb3; */
    background-color: #1c1c1cd0;
    color: white;
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;
    user-select: none;
    border-radius: 5px;
    padding: 10px 20px;
    margin-bottom: 8px;
    font-family: 'Saira', sans-serif;

    h4 {
        margin-block: 4px;
        font-weight: 400;
    }

    svg {
        transition: transform 0.2s;
        transform: ${(props) => (props.expanded ? 'rotate(180deg)' : 'rotate(0deg)')};
    }
`;

function DocumentsPage() {
    const [accountObject] = useContext(AccountContext);
    const [refreshTrigger, setRefreshTrigger] = useState(false);
    const [receivedPrivateDocuments, setReceivedPrivateDocuments] = useState([]);
    const [sentPrivateDocuments, setSentPrivateDocuments] = useState([]);
    const [uploadedPrivateDocuments, setUploadedPrivateDocuments] = useState([]);
    const [publicDocuments, setPublicDocuments] = useState([]);
    const [completedDocuments, setCompletedDocuments] = useState([]);

    const [categoriesExpanded, setCategoriesExpanded] = useState({
        uploaded: true,
        received: false,
        sent: false,
        public: false,
        completed: false,
    });

    const toggleCategory = (category) => {
        setCategoriesExpanded((prev) => ({
            ...prev,
            [category]: !prev[category],
        }));
    };

    useEffect(() => {
        (async () => {
            try {
                // Fetch public documents
                if (accountObject && accountObject.email) {
                    const publicDocumentsResponse = await fetchUserPublicDocumentsByEmail(accountObject.email);
                    console.log('publicDocumentsResponse.data: ', publicDocumentsResponse.data);
                    setPublicDocuments(publicDocumentsResponse.data);
                }

                // Fetch private documents
                if (accountObject?.loggedIn) {
                    const privateDocumentsResponse = await fetchUserPrivateDocuments();

                    if (privateDocumentsResponse.data.success) {
                        const allDocuments = privateDocumentsResponse.data.documents;

                        // Process each document to append signature status asynchronously
                        const documentsWithStatus = await Promise.all(
                            allDocuments.map(async (document) => {
                                try {
                                    const { data: signatureData } = await getSignaturesStatusForDoc(document.id);
                                    return { ...document, signatureStatus: signatureData };
                                } catch (error) {
                                    console.error('Error fetching signature status for document:', document.id, error);
                                    return { ...document, signatureStatus: { error: 'Failed to fetch status' } };
                                }
                            })
                        );

                        // Now filter documents into categories after all have been processed
                        const uploadedDocuments = documentsWithStatus.filter(
                            (doc) => doc.user_profile_id === accountObject.profile_id && doc.can_add_access
                        );
                        const sentDocuments = documentsWithStatus.filter(
                            (doc) => doc.user_profile_id === accountObject.profile_id && !doc.can_add_access
                        );
                        const receivedDocuments = documentsWithStatus.filter(
                            (doc) =>
                                doc.user_profile_id !== accountObject.profile_id &&
                                !doc.can_add_access &&
                                doc.signatureStatus.signatureStatus !== 'completed'
                        );
                        const completedDocuments = documentsWithStatus.filter(
                            (doc) => !doc.can_add_access && doc.signatureStatus.signatureStatus === 'completed'
                        );

                        // Update state with the processed and categorized documents
                        setReceivedPrivateDocuments(receivedDocuments);
                        setSentPrivateDocuments(sentDocuments);
                        setUploadedPrivateDocuments(uploadedDocuments);
                        setCompletedDocuments(completedDocuments);
                    }
                }
            } catch (error) {
                console.error('Error fetching documents:', error);
            }
        })();
    }, [refreshTrigger]); // Ensure refreshTrigger is correctly defined or used to trigger this effect

    const deleteUnsentDocument = async (documentId) => {
        try {
            const response = await deletePrivateUnsentDocument(documentId);
            console.log('Document successfully deleted:', response.data);
            return response.data; // You can return or handle the data as required for your application logic
        } catch (error) {
            // Handle errors that were flagged as authentication errors by the interceptor
            if (error.isAuthError) {
                console.error('Authentication error while deleting document:', error);
                throw new Error('Authentication error. Please log in again.');
            }

            if (error.response) {
                // Handle errors with a response (i.e., non-2xx status codes not related to auth which are caught by interceptor)
                console.error('Failed to delete document:', error.response.status, error.response.data);
                throw new Error(`Failed to delete document: ${error.response.data.message || 'Server error'}`);
            } else if (error.request) {
                // Handle errors without a response (no server response, network error, etc.)
                console.error('No response received when attempting to delete document:', error.request);
                throw new Error('No response from server. Please check your network connection.');
            } else {
                // Handle errors caused by setting up the request or other Axios issues
                console.error('Error setting up document deletion request:', error.message);
                throw new Error('Error setting up the request: ' + error.message);
            }
        }
    };

    return (
        <OutterDocumentsContainer>
            <DocumentsHeader>
                <h1>Documents</h1>
                <p>View all your documents linked to this account. All documents below are private except for 'Public' documents.</p>

                {!accountObject.wallet_address && (
                    <p style={{ marginBottom: '20px' }}>
                        <ErrorMessage>
                            <strong style={{ color: '#e42e00' }}>WARNING:</strong> Some documents might have been sent to you via a xrpl
                            wallet address, authenticate a wallet to see any additional documents sent to that wallet.
                        </ErrorMessage>
                    </p>
                )}
            </DocumentsHeader>

            <DocumentUploadButton to="/upload" className="buttonPop">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
            </DocumentUploadButton>
            <DocumentSections>
                <DocumentDisplaySection>
                    {categoriesExpanded.uploaded && uploadedPrivateDocuments.length > 0 && (
                        <DocumentsDisplay
                            arrayOfDocuments={uploadedPrivateDocuments}
                            viewerAccountId={accountObject.profile_id}
                            displayCategory={'upload'}
                            deleteDocument={deleteUnsentDocument} // Passing the delete function as a prop
                            setRefreshTrigger={setRefreshTrigger}
                        />
                    )}
                </DocumentDisplaySection>
                <DocumentDisplaySection>
                    <CategoryHeader expanded={categoriesExpanded.public} onClick={() => toggleCategory('public')}>
                        <h4>
                            Public <span>( {publicDocuments.length} )</span>
                        </h4>
                        {publicDocuments.length > 0 && <MdExpandLess />}
                    </CategoryHeader>
                    {categoriesExpanded.public && publicDocuments.length > 0 && (
                        <DocumentsDisplay
                            arrayOfDocuments={publicDocuments}
                            viewerAccountId={accountObject.profile_id}
                            displayCategory={'public'}
                        />
                    )}
                </DocumentDisplaySection>
                <DocumentDisplaySection>
                    <CategoryHeader expanded={categoriesExpanded.sent} onClick={() => toggleCategory('sent')}>
                        <h4>
                            Sent <span>( {sentPrivateDocuments.length} )</span>
                        </h4>
                        {sentPrivateDocuments.length > 0 && <MdExpandLess />}
                    </CategoryHeader>
                    {categoriesExpanded.sent && sentPrivateDocuments.length > 0 && (
                        <DocumentsDisplay
                            arrayOfDocuments={sentPrivateDocuments}
                            viewerAccountId={accountObject.profile_id}
                            displayCategory={'sent'}
                            setRefreshTrigger={setRefreshTrigger}
                        />
                    )}
                </DocumentDisplaySection>

                <DocumentDisplaySection>
                    <CategoryHeader expanded={categoriesExpanded.received} onClick={() => toggleCategory('received')}>
                        <h4>
                            Recieved <span>( {receivedPrivateDocuments.length} )</span>
                        </h4>
                        {receivedPrivateDocuments.length > 0 && <MdExpandLess />}
                    </CategoryHeader>
                    {categoriesExpanded.received && receivedPrivateDocuments.length > 0 && (
                        <DocumentsDisplay
                            arrayOfDocuments={receivedPrivateDocuments}
                            viewerAccountId={accountObject.profile_id}
                            displayCategory={'recieve'}
                        />
                    )}
                </DocumentDisplaySection>
                <DocumentDisplaySection style={{ marginBottom: '50px' }}>
                    <CategoryHeader expanded={categoriesExpanded.completed} onClick={() => toggleCategory('completed')}>
                        <h4>
                            Completed <span>( {completedDocuments.length} )</span>
                        </h4>
                        {completedDocuments.length > 0 && <MdExpandLess />}
                    </CategoryHeader>
                    {categoriesExpanded.completed && completedDocuments.length > 0 && (
                        <DocumentsDisplay
                            arrayOfDocuments={completedDocuments}
                            viewerAccountId={accountObject.profile_id}
                            displayCategory={'completed'}
                        />
                    )}
                </DocumentDisplaySection>
            </DocumentSections>
        </OutterDocumentsContainer>
    );
}

export default DocumentsPage;
