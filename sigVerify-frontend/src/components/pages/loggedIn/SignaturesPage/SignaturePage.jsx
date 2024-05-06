import { useState, useEffect, useContext } from 'react';
import styled from 'styled-components';
import { getAllUserSignatures } from '../../../../utils/httpRequests/routes/signatures';
import SignatureDisplay from '../ProfilePage/subComponents/SignatureDisplay';
import { ErrorMessage } from '../../../component-helpers/styled-elements/CommonStyles';
import { AccountContext } from '../../../../App';

const PageContainer = styled.div`
    width: 100%;
    max-width: 600px;
    display: flex;
    flex-direction: column;
    text-align: start;
    padding: 20px;
    /* font-size: 15px; */

    h2 {
        font-family: 'Saira', sans-serif;
    }
`;

const SignaturesHeader = styled.div`
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

function SignaturesPage() {
    const [accountObject] = useContext(AccountContext);
    const [signatures, setSignatures] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchSignatures = async () => {
            try {
                setLoading(true);
                const response = await getAllUserSignatures();
                console.log('RESPONSE: ', response);
                setSignatures(response.data.signatures);
            } catch (err) {
                setError('Failed to fetch signatures');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchSignatures();
    }, []);

    return (
        <PageContainer>
            <SignaturesHeader>
                <h1>Signatures</h1>
                <p>
                    View all signatures linked to your account. If you have not authenticated a wallet on the profile page, your signatures
                    will not populate.
                </p>
                {!accountObject.wallet_address && (
                    <p style={{ marginBottom: '20px' }}>
                        <ErrorMessage>
                            <strong style={{ color: '#e42e00' }}>WARNING:</strong> You have not yet linked an authenticated wallet to this
                            account.
                        </ErrorMessage>
                    </p>
                )}
            </SignaturesHeader>
            {loading ? (
                <p>Loading...</p>
            ) : error ? (
                <p>Error: {error}</p>
            ) : signatures?.length > 0 ? (
                <SignatureDisplay arrayOfSignatures={signatures} />
            ) : (
                <p style={{ maxWidth: '450px' }}> [ No signatures found... ]</p>
            )}
        </PageContainer>
    );
}

export default SignaturesPage;
