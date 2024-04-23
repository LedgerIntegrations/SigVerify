import { useState } from 'react';
import styled from 'styled-components';
import { fetchUserPublicDocumentsByEmail } from '../../../utils/httpRequests/routes/documents';
import DocumentsDisplay from '../loggedIn/DocumentsPage/subComponents/DocumentDisplay';

const PageContainer = styled.div`
    width: 100%;
    max-width: 600px;
    display: flex;
    flex-direction: column;
    text-align: start;
    padding: 20px;
    font-size: 16px;

    form {
        width: 100%;
        margin-bottom: 20px;
        display: flex;
        flex-direction: column;

        input {
            width: 100%;
            margin-bottom: 6px;
            max-width: 340px;
            height: 35px;
            padding: 5px 10px;
            border-radius: 10px;
            border: none;
            font-size: 0.85em;
            text-align: center;
            color: #7d7d7d;
        }

        button {
            border-radius: 5px;
            border: 1px solid #a3a3a3;
            max-width: 340px;
            background-color: white;
            padding: 5px 0px;
            color: #505050;

            &:hover {
                color: black;
            }
        }
    }
`;

const Header = styled.div`
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

const ProfileSearchPage = () => {
    const [searchInput, setSearchInput] = useState('');
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            // Replace this URL with your actual endpoint
            const response = await fetchUserPublicDocumentsByEmail(searchInput);
            console.log('response: ', response);
            if (!response.status === 200) {
                throw new Error('Failed to fetch documents.');
            }
            setDocuments(response.data);
        } catch (err) {
            setError(err.message);
            setDocuments([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <PageContainer>
            <Header>
                <h1>Search for Profile</h1>
                <p>
                    When searching profiles, you will be returned the users profile information, and any public documents the user has
                    uploaded.
                </p>
            </Header>

            <form onSubmit={handleSearch}>
                <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Email or Wallet Address"
                    required
                />
                <button type="submit" className="buttonPop">
                    Search
                </button>
            </form>
            {loading && <p>Loading...</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {!loading && !error && documents.length === 0 && <p>No documents found.</p>}
            {!loading && documents.length > 0 && <DocumentsDisplay arrayOfDocuments={documents} />}
        </PageContainer>
    );
};

export default ProfileSearchPage;
