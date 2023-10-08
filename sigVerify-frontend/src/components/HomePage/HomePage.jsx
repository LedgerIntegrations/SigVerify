import './HomePage.css'
import React from 'react';
import { Link } from 'react-router-dom';
import computerAsset from './assets/fingerprintlike_computer_midj.png';

function HomePage() {
    return (
        <div id="home-page-container">
            <div id="top-section">
                <h2>Sig Verify</h2>
                <img id="home-image" src={computerAsset} />
                <p id="call-to-action-text">Signed, Scanned, <br/> Delivered.</p>
                <p id="call-to-action-smaller">Premier document signing experience.</p>
            </div>
            <div id="bottom-section">
                <Link to="/login" >
                    <button className='buttonPop'>Connect Wallet</button>
                </Link>
            </div>
        </div>
    );
}

export default HomePage;