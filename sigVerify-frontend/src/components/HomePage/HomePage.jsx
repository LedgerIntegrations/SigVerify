import './HomePage.css'
import React from 'react';
import { Link } from 'react-router-dom';

function HomePage() {
    return (
        <div id="home-page-container">
            <h2>Welcome to <em>SigVerify</em></h2>
            {/* <button></button> */}
            <Link to="/login">
                <button>Connect XRPL Wallet</button>
            </Link>
        </div>
    );
}

export default HomePage;