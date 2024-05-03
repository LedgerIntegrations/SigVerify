import './AccountSigsPage.css';
import { useContext, useEffect, useState } from 'react';
import { AccountContext } from '../../../App';
import SigCard from '../SigCard/SigCard';

import { findAllAccountPaymentTransactions } from '../../../utils/httpRequests/routes/signatures';

function AccountSigsPage() {
    const [accountObject, setAccountObject] = useContext(AccountContext);
    const [sigObjects, setSigObjects] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    console.log(sigObjects);

    useEffect(() => {
        const fetchSigObjects = async () => {
            try {
                const response = await findAllAccountPaymentTransactions(accountObject.wallet);

                if (response.status !== 200) {
                    throw new Error(`Error ${response.status}: ${response.statusText}`);
                }

                setSigObjects(response.data);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        if (accountObject.wallet) {
            fetchSigObjects();
        }
    }, [accountObject.wallet]); // Ensures this runs when accountObject.wallet changes

    return (
        <div id="accountSigsPageMainContainer">
            <div id="sigs-header">
                <h2>
                    ACCOUNT SIGNATURES{' '}
                    <em>...{accountObject.wallet.slice(accountObject.wallet.length - 7, accountObject.wallet.length)}</em>
                </h2>
                <p>
                    Signatures: <em>{sigObjects ? sigObjects.length : 'No signatures found.'}</em>
                </p>
            </div>
            {isLoading ? (
                <div className="spinner-container">
                    <div className="spinner-circle"></div>
                </div>
            ) : error ? (
                <p>Error: {error}</p>
            ) : sigObjects ? (
                <div id="accountSigsPageContainer">
                    {sigObjects.map((sigObject) => (
                        <SigCard sigObject={sigObject} />
                    ))}
                </div>
            ) : (
                <p>No data found!</p>
            )}
        </div>
    );
}

export default AccountSigsPage;
