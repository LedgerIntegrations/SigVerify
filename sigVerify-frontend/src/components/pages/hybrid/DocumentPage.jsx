import { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { AccountContext } from '../../../App';
import SignatureModal from '../hybrid/subComponents/SignatureModal';
import styled from 'styled-components';
import logoImg from '../../../assets/svLogo.png';
import { Link } from 'react-router-dom';
import { fetchPrivateDocument, fetchPublicDocument } from '../../../utils/httpRequests/routes/documents';
import { getAllUserSignatures, getDocumentSignatures } from '../../../utils/httpRequests/routes/signatures';
import LoadingIcon from '../../component-helpers/components/LoadingIcon';
import { IoIosWarning } from 'react-icons/io';
import { TbError404 } from 'react-icons/tb';
import SignaturesList from '../loggedIn/DocumentsPage/subComponents/SignaturesList';
import DocumentEmbed from './subComponents/DocumentEmbed';

const Loader = styled(LoadingIcon)`
    .loading-icon {
        height: 100px;
        width: 100px;
    }
`;

const Loading = styled.div`
    min-height: 100vh;

    Header {
        min-height: 20vh;

        h3 {
            margin-top: 0px;
            padding-top: 36px;
        }
    }

    p {
        font-size: 36px;
    }

    .loading-icon {
        display: block;
        height: 100px !important;
        width: 100px;
        margin-inline: auto;

        svg {
            height: 100px;
            width: 100px;
        }
    }
`;

const AccessDenied = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 50px;
    padding-top: 20px;
    text-align: start;
    max-width: 555px;
    margin-inline: auto;

    svg {
        width: 200px;
        height: 200px;
        margin-bottom: 6vw;
        color: #bd4646ea;
    }

    p {
        font-size: 16px;
        margin-block: 0px;
        color: #bd4646ea;
    }

    em {
        text-align: center;
        margin-top: 6vw;
        color: #baabba;
    }
`;

const DocumentPageContainer = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0px;
    max-width: 1200px;
    margin-inline: auto;
`;

const Header = styled.header`
    h3 {
        margin-top: ${(props) => (props.loggedIn ? '12px' : '34px')};
        margin-bottom: 34px;
        margin-left: 12px;
        font-family: 'Saira', sans-serif;
        font-weight: 400;
        font-size: 1.25em;
    }

    @media (min-width: 620px) {
        font-size: 1.4em;
    }
`;

const DocumentInterface = styled.div`
    display: grid;
    gap: 10px;
    width: 100%;
    grid-template-columns: 1fr; // Default to single column layout on smaller screens

    @media (min-width: 620px) {
        grid-template-columns: repeat(24, 1fr); // Then switch to more complex grid layout for wider screens
        height: 100%;
    }
`;

const LogoLink = styled(Link)`
    position: absolute;
    top: 24px;
    left: 20px;

    img {
        height: 40px;
        width: 40px;
    }
`;

const SignatureSection = styled.section`
    padding: 0px 10px;
    display: flex;
    flex-direction: column;
    align-items: center;

    a {
        width: 100%;
    }

    #alreadySignedMessage {
        color: #bd4646ea;
    }

    #docInterfaceButton {
        width: 70%;
        margin-top: 5px;
        padding: 6px 10px;
        border-radius: 10px;
        font-size: 0.8em;
        border: 1px solid black;
        background-color: #ffffff;

        @media (min-width: 620px) {
            width: 100%;
        }
    }

    @media (min-width: 620px) {
        grid-column: 2/9;
        grid-row: 1;
        border-right: 1px solid black;
        align-items: stretch;
    }
`;

const DocumentSignaturesList = styled.div`
    width: 90%;
    min-height: 50px;
    margin: 20px 0px;
    border-radius: 10px;
`;

const DocumentPage = () => {
    const { documentId } = useParams();
    const [documentData, setDocumentData] = useState(null);
    const [documentSignatures, setDocumentSignatures] = useState([]);
    const [showSignaturesList, setShowSignaturesList] = useState(false);
    const [accountObject] = useContext(AccountContext);
    const [signatureModalOpen, setSignatureModalOpen] = useState(false);
    const [documentHash, setDocumentHash] = useState(null);
    const [hasUserAlreadySigned, setHasUserAlreadySigned] = useState(false);
    const [accessDenied, setAccessDenied] = useState(false);
    const [notFound, setNotFound] = useState(false);

    async function convertSignedUrlToFileAndHash(fetchedDocumentData) {
        try {
            // Step 1: Fetch the file
            const response = await fetch(fetchedDocumentData.preSignedUrl);
            if (!response.ok) {
                throw new Error(`Failed to fetch file: ${response.statusText}`);
            }

            // Step 2: Create a blob from the response
            const blob = await response.blob();

            // Step 3: Convert the blob to a file
            const file = new File([blob], fetchedDocumentData.meta.filename, { type: blob.type });

            const arrayBuffer = await file.arrayBuffer();
            const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
            console.log('SHA-256 Hash:', hashHex);

            return hashHex;
        } catch (error) {
            console.error('Error fetching file from presigned URL', error);
            throw error;
        }
    }

    function toggleModal() {
        setSignatureModalOpen(!signatureModalOpen);
    }

    const hasUserSignedDocument = async () => {
        try {
            const userSignaturesResponse = await getAllUserSignatures();
            console.log('user Signatures: ', userSignaturesResponse);
            const userSignatures = userSignaturesResponse.data.signatures;
            const hasSigned = userSignatures.some((object) => object.document_id === documentId);
            console.log('user signatures: ', userSignatures);
            if (hasSigned) {
                setHasUserAlreadySigned(true);
            }
        } catch (error) {
            console.log('Error fetching signatures in document page: ', error);
        }
    };

    const fetchDocument = async () => {
        try {
            // Try to fetch from the public endpoint
            let response = await fetchPublicDocument(documentId);
            setDocumentData(response.data);

            // hash File object of document we are viewing to add to signature memo
            const documentHash = await convertSignedUrlToFileAndHash(response.data);
            if (documentHash) {
                setDocumentHash(documentHash);
            }
        } catch (error) {
            console.log('Error on public document fetch:', error);

            // If public fetch fails due to 403, attempt private fetch only if user is authenticated
            if (error.response && error.response.status === 403) {
                console.log('Trying to fetch from private endpoint...');
                try {
                    const response = await fetchPrivateDocument(documentId);
                    setDocumentData(response.data);
                    const documentHash = await convertSignedUrlToFileAndHash(response.data);
                    if (documentHash) {
                        setDocumentHash(documentHash);
                    }
                } catch (privateError) {
                    // Handle errors for private document fetch here
                    console.error('Error fetching private document:', privateError);
                    setAccessDenied(true);
                }
            } else {
                setNotFound(true);
            }
        }
    };

    const fetchDocumentSignatures = async () => {
        try {
            const documentSignaturesResponse = await getDocumentSignatures(documentId);
            setDocumentSignatures(documentSignaturesResponse.data.signatures);
            console.log('Updated Signatures: ', documentSignaturesResponse.data.signatures);
        } catch (error) {
            console.error('Error fetching signatures:', error);
        }
    };

    const handleSignatureSuccess = (newSignature) => {
        // fetchDocumentSignatures(); // Refetch signatures to update the list
        setDocumentSignatures((prev) => [...prev, newSignature]);
        setHasUserAlreadySigned(true);

        console.log('Signature added successfully', newSignature);
    };

    useEffect(() => {
        fetchDocument();
        fetchDocumentSignatures();

        if (accountObject.loggedIn) {
            hasUserSignedDocument();
        }
    }, [documentId, accountObject]);

    if (!documentData) {
        return (
            <Loading>
                <Header loggedIn={accountObject.loggedIn}>
                    <h3>SigVerify Document Interface</h3>
                    <LogoLink to="/">
                        <img src={logoImg} alt="SigVerify Logo" />
                    </LogoLink>
                </Header>
                {!accessDenied && !notFound && (
                    <>
                        <p>Loading...</p>
                        <Loader />
                    </>
                )}

                {notFound && (
                    <AccessDenied>
                        <TbError404 />
                        <p>Document not found, or does not exist.</p>
                    </AccessDenied>
                )}

                {accessDenied && (
                    <AccessDenied>
                        <IoIosWarning />
                        <p>This is a private document !</p>
                        <p>You do not have access !</p>

                        <em>Login with an email address containing access rights to view this document.</em>
                    </AccessDenied>
                )}
            </Loading>
        );
    }

    console.log('Document data: ', documentData);

    return (
        <DocumentPageContainer>
            <Header loggedIn={accountObject.loggedIn}>
                <h3>SigVerify Document Interface</h3>
                <LogoLink to="/">
                    <img src={logoImg} alt="SigVerify Logo" />
                </LogoLink>
            </Header>
            <DocumentInterface>
                <SignatureSection>
                    {hasUserAlreadySigned ? (
                        <>
                            <p id="alreadySignedMessage">You have already signed this document!</p>
                            <Link to="/signatures">
                                <button id="docInterfaceButton" className="buttonPop">
                                    My Signatures
                                </button>
                            </Link>
                        </>
                    ) : (
                        <button id="docInterfaceButton" onClick={toggleModal} className="buttonPop">
                            Sign Document
                        </button>
                    )}
                    <button id="docInterfaceButton" onClick={() => setShowSignaturesList((prev) => !prev)} className="buttonPop">
                        {showSignaturesList
                            ? `Hide Signatures (${documentSignatures.length})`
                            : `View Signatures (${documentSignatures.length})`}
                    </button>
                    {signatureModalOpen && (
                        <SignatureModal
                            documentId={documentId}
                            onClose={toggleModal}
                            documentHash={documentHash}
                            onSignatureSuccess={handleSignatureSuccess}
                        />
                    )}
                </SignatureSection>
                <DocumentEmbed
                    documentUrl={documentData.preSignedUrl}
                    mimeType={documentData.meta.content_type}
                    filename={documentData.meta.filename}
                />
            </DocumentInterface>
            {showSignaturesList && (
                <DocumentSignaturesList>
                    <SignaturesList signatures={documentSignatures} />
                </DocumentSignaturesList>
            )}
        </DocumentPageContainer>
    );
};

export default DocumentPage;
