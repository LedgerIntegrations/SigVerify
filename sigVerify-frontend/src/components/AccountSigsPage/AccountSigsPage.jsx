import './AccountSigsPage.css';
import React, { useContext, useEffect, useState } from 'react';
import { AccountContext } from '../../App';

function AccountSigsPage() {
    const [accountObject, setAccountObject] = useContext(AccountContext);
    const [sigObjects, setSigObjects] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSigObjects = async () => {
            try {
                const response = await fetch('http://localhost:3001/api/findAllAccountPaymentTransactionsToSigVerifyWallet', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ rAddress: accountObject.wallet }),
                });

                if (!response.ok) {
                    throw new Error(`Error ${response.status}: ${response.statusText}`);
                }

                const result = await response.json();
                setSigObjects(result);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSigObjects();
    }, [accountObject.wallet]); // Added accountObject.wallet as a dependency

    return (
        <div id="accountSigsPageMainContainer">
            {isLoading ? (
                <p>Loading...</p>
            ) : error ? (
                <p>Error: {error}</p>
            ) : sigObjects ? (
                <div id="accountSigsPageContainer">
                    {sigObjects.map(sigObject => (
                        <div key={sigObject.TransactionHash} className='sigTxDiv'>
                            {Object.entries(sigObject).map(([key, value]) => (
                                <p key={key}><strong>{key}:</strong> {String(value)}</p>
                            ))}
                        </div>
                    ))}
                </div>
            ) : (
                <p>No data found!</p>
            )}
        </div>
    );
}

export default AccountSigsPage;
