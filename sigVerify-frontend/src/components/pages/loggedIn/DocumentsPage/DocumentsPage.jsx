import { useState, useContext, useEffect } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { MdExpandLess } from 'react-icons/md';
import { ErrorMessage } from '../../../component-helpers/styled-elements/CommonStyles';
import { AccountContext } from '../../../../App';
import useFetchAndCategorizePrivateDocuments from '../../../../utils/hooks/useFetchAndCategorizePrivateDocuments';
import DocumentsDisplay from './subComponents/DocumentDisplay';
import { fetchUserPublicDocumentsByEmail } from '../../../../utils/httpRequests/routes/documents';
import { deletePrivateUnsentDocument } from '../../../../utils/httpRequests/routes/documents';

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
    /* font-family: 'Teko', sans-serif; */
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
    margin-bottom: 58px;
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
        transform: ${(props) => (props.$expanded ? 'rotate(180deg)' : 'rotate(0deg)')};
    }
`;

function DocumentsPage() {
    const [accountObject] = useContext(AccountContext);
    const [publicDocuments, setPublicDocuments] = useState([]);
    const { uploaded, received, sent, completed, refresh } = useFetchAndCategorizePrivateDocuments(accountObject);

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
        async function fetchPublicDocuments() {
            if (accountObject && accountObject.email) {
                try {
                    const response = await fetchUserPublicDocumentsByEmail(accountObject.email);
                    setPublicDocuments(response.data || []);
                } catch (error) {
                    console.error('Error fetching public documents:', error);
                }
            }
        }
        fetchPublicDocuments();
    }, [accountObject]); // Re-fetch public documents when accountObject changes

    const deleteUnsentDocument = async (documentId) => {
        try {
            const response = await deletePrivateUnsentDocument(documentId);
            if (response.status === 200) {
                console.log('Document successfully deleted:', response.data);
                refresh(); // Refresh the document lists to reflect this deletion
            }
        } catch (error) {
            console.error('Error while deleting document:', error);
            if (error.response) {
                console.error('Failed to delete document:', error.response.status, error.response.data);
                throw new Error(`Failed to delete document: ${error.response.data.message || 'Server error'}`);
            } else {
                throw new Error('Error deleting document: ' + (error.message || 'Check network connection'));
            }
        }
    };

    // Prepare a mapping to easily access document categories
    const documentCategories = {
        uploaded,
        public: publicDocuments,
        sent,
        received,
        completed,
    };

    return (
        <OutterDocumentsContainer>
            <DocumentsHeader>
                <h1>Documents</h1>
                <p>View all your documents linked to this account. All documents below are private except for 'Public' documents.</p>
                {!accountObject.wallet_address && (
                    <p style={{ marginBottom: '20px' }}>
                        <ErrorMessage>
                            <strong style={{ color: '#e42e00' }}>WARNING:</strong> Some documents might have been sent to you via a XRPL
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
                {Object.keys(documentCategories).map((category) => (
                    <DocumentDisplaySection key={category}>
                        <CategoryHeader $expanded={categoriesExpanded[category]} onClick={() => toggleCategory(category)}>
                            <h4>
                                {category.charAt(0).toUpperCase() + category.slice(1)} <span>({documentCategories[category].length})</span>
                            </h4>
                            {documentCategories[category].length > 0 && <MdExpandLess />}
                        </CategoryHeader>
                        {categoriesExpanded[category] && documentCategories[category].length > 0 && (
                            <DocumentsDisplay
                                arrayOfDocuments={documentCategories[category]}
                                viewerAccountId={accountObject.profile_id}
                                displayCategory={category}
                                deleteDocument={deleteUnsentDocument}
                                setRefreshTrigger={refresh}
                            />
                        )}
                    </DocumentDisplaySection>
                ))}
            </DocumentSections>
        </OutterDocumentsContainer>
    );
}

export default DocumentsPage;
