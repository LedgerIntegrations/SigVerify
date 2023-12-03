import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import Tile from '../Tile/Tile';

const FooterBalancer = styled.div`
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
`;

const ToggleButton = styled.div`
    position: absolute;
    top: 15px;
    width: 120px;
    height: 12px;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
`;

const Line = styled.div`
    width: 100%;
    height: 2px;
    background-color: #444;
`;

const FooterContainer = styled.div`
    height: ${props => props.$isOpen ? '27vh' : '5vh'};
    margin-inline: auto;
    width: 100%;
    max-width: 500px;
    position: fixed;
    bottom: 0;
    // background-color: #444444e4;
    background-color: white;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 40px 40px 0px 0px;
    z-index: 20;
    transition: height 0.3s ease;
`;

const Uploadbutton = styled(Link)`
    position: absolute;
    top: 5vh;
    font-size: .85em;
    background-color: #333;
    color: white;
    width: 195px;
    border-radius: 20px;
    max-width: 350px;
    height: 36px;
    padding-block: 5px;
    padding-top: 10px;
    margin-inline: 80px;

    &:hover {
        background-color: #111;
    }
`

const DashboardNavTiles = styled.div`
    opacity: ${props => props.$isOpen ? '1' : '0'};
    transform: translateY(${props => props.$isOpen ? '35px' : '20px'});
    transition: opacity 0.3s ease, transform 0.3s ease;
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 6px;
    padding-block: 15px;
    padding-inline: 80px;
    width: 100%;
    max-width: 350px;
    font-family: 'Kdam Thmor Pro', sans-serif;
    pointer-events: ${props => props.$isOpen ? 'all' : 'none'};

    a {
        min-height: 50px;
        color: white;
    }
`;


const documentIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
);

const filledDocIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="100" height="100" viewBox="0 0 50 50" stroke="white" fill="currentColor">
        <path d="M 30.398438 2 L 7 2 L 7 48 L 43 48 L 43 14.601563 Z M 15 28 L 31 28 L 31 30 L 15 30 Z M 35 36 L 15 36 L 15 34 L 35 34 Z M 35 24 L 15 24 L 15 22 L 35 22 Z M 30 15 L 30 4.398438 L 40.601563 15 Z"></path>
    </svg>
)

const signatureIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.864 4.243A7.5 7.5 0 0119.5 10.5c0 2.92-.556 5.709-1.568 8.268M5.742 6.364A7.465 7.465 0 004.5 10.5a7.464 7.464 0 01-1.15 3.993m1.989 3.559A11.209 11.209 0 008.25 10.5a3.75 3.75 0 117.5 0c0 .527-.021 1.049-.064 1.565M12 10.5a14.94 14.94 0 01-3.6 9.75m6.633-4.596a18.666 18.666 0 01-2.485 5.33" />
    </svg>
);

const keySvg = (
    <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="100" height="100" viewBox="0 0 50 50" stroke="white" fill="currentColor">
        <path d="M 34 0 C 25.179688 0 18 7.179688 18 16 C 18 17.957031 18.355469 19.828125 19 21.5625 L 0 40.59375 L 0 46.59375 L 18.5625 28 L 20 29.4375 L 1 48.40625 L 2.59375 50 L 9.40625 50 L 13 46.40625 L 13 44 L 15.40625 44 L 19 40.40625 L 19 39 L 20.40625 39 L 23 36.40625 L 23 35 L 24.40625 35 L 28.4375 30.96875 C 30.175781 31.617188 32.039063 32 34 32 C 42.820313 32 50 24.820313 50 16 C 50 7.179688 42.820313 0 34 0 Z M 34 5 C 36.9375 5 39.703125 6.140625 41.78125 8.21875 C 43.859375 10.296875 45 13.0625 45 16 C 45 18.9375 43.859375 21.703125 41.78125 23.78125 L 41.0625 24.5 L 25.5 8.9375 L 26.21875 8.21875 C 28.296875 6.140625 31.0625 5 34 5 Z"></path>
    </svg>
);

const profileIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>

);

const settingsIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12a7.5 7.5 0 0015 0m-15 0a7.5 7.5 0 1115 0m-15 0H3m16.5 0H21m-1.5 0H12m-8.457 3.077l1.41-.513m14.095-5.13l1.41-.513M5.106 17.785l1.15-.964m11.49-9.642l1.149-.964M7.501 19.795l.75-1.3m7.5-12.99l.75-1.3m-6.063 16.658l.26-1.477m2.605-14.772l.26-1.477m0 17.726l-.26-1.477M10.698 4.614l-.26-1.477M16.5 19.794l-.75-1.299M7.5 4.205L12 12m6.894 5.785l-1.149-.964M6.256 7.178l-1.15-.964m15.352 8.864l-1.41-.513M4.954 9.435l-1.41-.514M12.002 12l-3.75 6.495" />
    </svg>
);

const walletIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
    </svg>
);

const homeIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205l3 1m1.5.5l-1.5-.5M6.75 7.364V3h-3v18m3-13.636l10.5-3.819" />
    </svg>
);

const Footer = () => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleFooter = () => {
        setIsOpen(!isOpen);
    };

    return (
        <FooterBalancer>
            <FooterContainer $isOpen={isOpen}>
                <ToggleButton onClick={toggleFooter}>
                    <Line />
                    <Line />
                    <Line />
                </ToggleButton>
                <Uploadbutton className="buttonPop" to="/upload">Upload</Uploadbutton>
                <DashboardNavTiles $isOpen={isOpen}>
                    <Tile title="Home" icon={homeIcon} link="/dashboard" finePrint="" />
                    <Tile title="Profile" icon={profileIcon} link="/profile" finePrint="" />
                    <Tile title="Settings" icon={settingsIcon} link="/settings" finePrint="" />
                    <Tile title="Docs" icon={documentIcon} link="/documents" finePrint="" />
                    <Tile title="Xrpl" icon={signatureIcon} link="/xrpl-ui" finePrint="" />
                </DashboardNavTiles>
            </FooterContainer>
        </FooterBalancer>

    )
}

export default Footer;
