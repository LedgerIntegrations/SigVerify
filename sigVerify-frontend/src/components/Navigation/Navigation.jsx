import './Navigation.css'
import React from 'react';
import { Link } from 'react-router-dom';
import logoImg from './assets/svLogo.png'
function Navigation() {
    return (
        <div id="nav-container">
            <Link to="/" id="nav-logo">
                <img src={logoImg}/>
            </Link>
            <div id="nav-links">
                <Link to="/">Home</Link>
                <Link to="/verify">Verify Signature</Link>
            </div>
        </div>
    );
}

export default Navigation;
