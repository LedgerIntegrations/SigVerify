import './SigCard.css'
import React, { useState } from 'react';

// currently taken out of application temporarily

function SigCard({ sigObject }) {
    const [allDetailsFlag, setAllDetailsFlag] = useState(false);

    function dropDownTrigger() {
        setAllDetailsFlag(!allDetailsFlag);
    }
    return (
        <div key={sigObject.TransactionHash} className='sigTxDiv'>
            <div className="card-left">
                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} stroke="green" className="green-check">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
            <div className="card-right">
                <p><strong><br /></strong> {sigObject.date}</p>
                <p><strong><br />{sigObject.Signer}</strong></p>
                <p><strong><br />{sigObject.DocumentHash}</strong></p>
            </div>
            <div>
                <button className='expand-sig-button' onClick={dropDownTrigger}>See all details</button>
                {
                    allDetailsFlag ? (
                        <div className='detailsDiv'>
                            {Object.entries(sigObject).map(([key, value]) => (
                                <p key={key}>
                                    {key}: <em>{value}</em>
                                </p>
                            ))}
                        </div>
                    ) : null
                }
            </div>


        </div>
    )
}

export default SigCard;