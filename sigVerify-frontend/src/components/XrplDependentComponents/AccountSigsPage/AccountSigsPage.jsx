import './AccountSigsPage.css';
import React, { useContext, useEffect, useState } from 'react';
import { AccountContext } from '../../../App';
import SigCard from '../SigCard/SigCard';

// currently taken out of application temporarily

function AccountSigsPage() {
    const [accountObject, setAccountObject] = useContext(AccountContext);
    const [sigObjects, setSigObjects] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    console.log(sigObjects)

    useEffect(() => {
        const fetchSigObjects = async () => {
            try {
                const response = await fetch('http://localhost:3001/api/user/findAllAccountPaymentTransactionsToSigVerifyWallet', {
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
            <div id="sigs-header">
                <h2>ACCOUNT SIGNATURES <em>...{accountObject.wallet.slice(accountObject.wallet.length - 7, accountObject.wallet.length)}</em></h2>
                <p>Signatures: <em>{sigObjects ? sigObjects.length : "No signatures found."}</em></p>
            </div>
            {isLoading ? (
                <div className="spinner-container">
                    <div className="spinner-circle">
                    </div>
                </div>
            ) : error ? (
                <p>Error: {error}</p>
            ) : sigObjects ? (
                <div id="accountSigsPageContainer">
                    {sigObjects.map(sigObject => (
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
