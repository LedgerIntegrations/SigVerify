import './HomePage.css'
import React from 'react';
import { Link } from 'react-router-dom';
import encDocs from './assets/enc_docs.svg';

function HomePage() {
    return (
        <div id="home-page-container">
            <img src={encDocs} />
            <div id="home-call-to-action-section">
                <h2>Welcome to <br /><em>SigVerify</em></h2>
                {/* <button></button> */}
                <Link to="/login" >
                    <button className='buttonPop'>Connect XRPL Wallet</button>
                </Link>
            </div>

        </div>
    );
}

export default HomePage;