import { useContext, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import logoImg from '../../assets/svLogo.png';
import { RiTwitterXLine } from 'react-icons/ri';
import { FaLinkedinIn } from 'react-icons/fa6';
import { SiDiscord } from 'react-icons/si';
import { SiLinktree } from 'react-icons/si';
import { AccountContext } from '../../App';
import kickUnauthenticatedUser from '../../utils/httpRequests/kickUnauthenticatedUser';
import { deleteUserXrplWallet } from '../../utils/httpRequests/routes/users';

const slideIn = keyframes`
from {
     transform: translateX(-100%);
  }

  to {
    transform: translateX(0%);
  }
`;

const slideOut = keyframes`
from {
     transform: translateX(0%);
  }

  to {
    transform: translateX(-100%);
  }
`;

const NavigationContainer = styled.div`
    display: flex;
    position: fixed;
    top: 0px;
    left: 0px;
    background-color: rgb(236, 235, 235, 0.95);
    flex-direction: column;
    padding: 2vh 4vw;
    min-height: 68px;
    height: 11vh;
    width: 100%;
    z-index: 20;
`;

const NavigationHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const NavIconsDiv = styled.div`
    display: flex;
`;

const NavigationMobileHamburger = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 3px;
    height: 36px;
    padding: 7px 10px;
    margin: 10px;
    margin-left: 0px;
    border-radius: 10px;
    background-color: white;
`;

const HamburgerLine = styled.div`
    width: 22px;
    height: 2px;
    background-color: #777;
`;

const NavigationList = styled.ul`
    width: 100%;
    height: calc(100vh - 65px);
    background-color: rgb(236, 235, 235, 0.95);
    list-style: none;
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 0px;
    padding-block: 50px;
    position: absolute;
    padding-inline-start: 0px;
    top: 72px;
    left: 0px;
    z-index: 20;
    overflow-y: auto;
    transform: translateX(-100%);
    transition: transform 0.5s;
`;

const NavigationListAnimated = styled(NavigationList)`
    animation: ${(props) => (props.$hamburgerIsOpen ? slideIn : props.$hamburgerHasBeenOpened ? slideOut : 'none')} 0.5s forwards;
`;

const HamburgerButtonActivated = styled(NavigationMobileHamburger)`
    box-shadow: ${(props) =>
        props.$hamburgerIsOpen
            ? `inset 2px 2px 2px 1px rgba(59, 59, 59, 0.5),
       7px 3px 5px 0px rgba(0, 0, 0, 0),
       0px 0px 0px 0px rgba(0, 0, 0, .1)`
            : `inset 2px 2px 2px 0px rgba(255, 255, 255, .5),
       7px 3px 5px 0px rgba(0, 0, 0, .1),
       4px 4px 5px 0px rgba(0, 0, 0, .1)`};

    ${HamburgerLine} {
        background-color: ${(props) => (props.$hamburgerIsOpen ? '#333' : '#777')};
    }

    &:hover {
        ${HamburgerLine} {
            background-color: #333;
        }
    }
`;

const SettingsButtonActivated = styled(NavigationMobileHamburger)`
    box-shadow: ${(props) =>
        props.$settingsIsOpen
            ? `inset 2px 2px 2px 1px rgba(59, 59, 59, 0.5),
       7px 3px 5px 0px rgba(0, 0, 0, 0),
       0px 0px 0px 0px rgba(0, 0, 0, .1)`
            : `inset 2px 2px 2px 0px rgba(255, 255, 255, .5),
       7px 3px 5px 0px rgba(0, 0, 0, .1),
       4px 4px 5px 0px rgba(0, 0, 0, .1)`};
    color: #777;

    &:hover {
        color: #333;
    }
`;

const SettingsListAnimated = styled(NavigationList)`
    animation: ${(props) => (props.$settingsIsOpen ? slideIn : props.$settingsHasBeenOpened ? slideOut : 'none')} 0.5s forwards;

    h3 {
        width: 90%;
        max-width: 480px;
        text-align: start;
        margin-left: 40px;
        margin-bottom: 0px;
        color: #494747;
        font-size: 28px;
        font-family: 'Saira', sans-serif;
    }

    h2 {
        width: 90%;
        max-width: 480px;
        text-align: start;
        margin-left: 40px;
        margin-block: 0px;
        margin-bottom: 28px;
        font-size: 16px;
        font-style: italic;
        color: #9e9c9c;
        border-radius: 5px;
    }
`;

const NavigationItem = styled.li`
    display: flex;
    flex-direction: column;
    align-items: start;
    border: none;
    border-radius: 10px;
    margin-inline: 10px;
    width: 80%;
    max-width: 420px;
    padding: 0px;

    a {
        text-decoration: none;
    }
`;

const SettingsItem = styled.li`
    display: flex;
    flex-direction: column;
    align-items: start;
    border-radius: 10px;
    margin-inline: 10px;
    width: 90%;
    max-width: 480px;
    padding: 14px 20px;

    p {
        text-align: start;
        font-size: 0.6em;
        margin-top: 0px;
        margin-bottom: 6px;
        color: #8b8b8b;
    }

    a {
        text-decoration: none;
    }
`;

const SettingsButton = styled.button`
    font-size: 11px;
    border-radius: 5px;
    border: none;
    padding: 4px 8px;
    padding-top: 5px;
    color: white;
    background-color: #474747;
`;

const NavigationLink = styled(Link)`
    font-size: 20px;
    color: white;
    padding: 15px 30px;
    width: 100%;
    max-width: 420px;
    border-radius: 10px;
    text-align: center;
    background-color: #222;
    font-family: 'Saira', sans-serif;

    &:hover {
        color: #222;
        background-color: white;
    }
`;

const BaseLogo = styled.span`
    display: flex;
    gap: 4px;
`;

const LogoNavigation = styled(Link)`
    width: fit-content;
    height: fit-content;
    padding: 8px;

    svg {
        height: 42px;
        width: 42px;
        color: #777;

        &:hover {
            color: #555;
        }
    }

    img {
        height: 42px;
        width: 42px;
        margin: 0px;
    }
`;

const CompanyName = styled.h4`
    margin-top: 22.5px;
    margin-bottom: 0px;
    color: black;
    font-size: 0.8em;
    letter-spacing: 5px;
    text-transform: uppercase;
`;

const LogoutButton = styled.button`
    padding: 5px 20px;
    padding-top: 7px;
    /* color: #9d3c2f; */
    color: white;
    border-radius: 5px;
    border: none;
    align-self: center;
    margin-top: 20px;
    background-color: #f24d4d;

    &:hover {
        background-color: #a92511;
    }
`;

const backArrowSvg = (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
            d="M4.5 12L9.5 7M4.5 12L9.5 17M4.5 12L14.5 12C16.1667 12 19.5 13 19.5 17"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

const settingsIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.5 12a7.5 7.5 0 0015 0m-15 0a7.5 7.5 0 1115 0m-15 0H3m16.5 0H21m-1.5 0H12m-8.457 3.077l1.41-.513m14.095-5.13l1.41-.513M5.106 17.785l1.15-.964m11.49-9.642l1.149-.964M7.501 19.795l.75-1.3m7.5-12.99l.75-1.3m-6.063 16.658l.26-1.477m2.605-14.772l.26-1.477m0 17.726l-.26-1.477M10.698 4.614l-.26-1.477M16.5 19.794l-.75-1.299M7.5 4.205L12 12m6.894 5.785l-1.149-.964M6.256 7.178l-1.15-.964m15.352 8.864l-1.41-.513M4.954 9.435l-1.41-.514M12.002 12l-3.75 6.495"
        />
    </svg>
);

const FooterSocial = styled.ul`
    background-color: #e6e6e6;
    text-decoration: none;
    list-style: none;
    display: flex;
    gap: 2rem;
    padding: 20px;
    border: 1px solid gray;
    border-radius: 20px;
    box-shadow: inset 2px 2px 2px 1px rgba(59, 59, 59, 0.5), 7px 7px 20px 0px rgba(0, 0, 0, 0.1), 0px 0px 0px 0px rgba(0, 0, 0, 0.1);
    position: relative;
    bottom: 35px;

    li {
        a {
            cursor: pointer;

            &:-webkit-any-link {
                color: black;
            }

            svg {
                height: 22px;
                width: 22px;

                &:hover {
                    color: gray;
                }
            }
        }
    }

    img {
        width: 28px;
        height: 28px;
    }
`;

const SocialsDisplay = () => {
    return (
        <FooterSocial>
            <li>
                <a href="https://twitter.com/XRPIntegrations" target="_blank" rel="noopener noreferrer">
                    <RiTwitterXLine />
                </a>
            </li>
            <li>
                <a href="https://www.linkedin.com/company/ledger-integrations/" target="_blank" rel="noopener noreferrer">
                    <FaLinkedinIn />
                </a>
            </li>
            <li>
                <a href="https://twitter.com/XRPIntegrations" target="_blank" rel="noopener noreferrer">
                    <SiDiscord />
                </a>
            </li>
            <li>
                <a href="https://twitter.com/XRPIntegrations" target="_blank" rel="noopener noreferrer">
                    <SiLinktree />
                </a>
            </li>
        </FooterSocial>
    );
};

const ConfirmationModal = ({ isOpen, onClose, onConfirm }) => {
    if (!isOpen) return null;

    return (
        <div
            style={{
                position: 'fixed',
                top: '0',
                left: '0',
                right: '0',
                bottom: '0',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                zIndex: '1000',
            }}
        >
            <div
                style={{
                    padding: '20px',
                    backgroundColor: 'white',
                    borderRadius: '5px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                }}
            >
                <h2>Are you sure you want to remove the current wallet from your account?</h2>
                <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-around' }}>
                    <button onClick={onClose} style={{ padding: '10px 20px' }}>
                        Cancel
                    </button>
                    <button onClick={onConfirm} style={{ padding: '10px 20px' }}>
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
};

const NavigationComponent = () => {
    // eslint-disable-next-line no-unused-vars
    const [accountObject, setAccountObject] = useContext(AccountContext);
    const [isModalOpen, setIsModalOpen] = useState(false);

    console.log('Navigation component rendering...');

    const navigate = useNavigate();

    const goBack = () => {
        navigate(-1);
    };

    const logoutUser = async () => {
        await kickUnauthenticatedUser(setAccountObject);
    };

    const [hamburgerIsOpen, setHamburgerIsOpen] = useState(false);
    const [hamburgerHasBeenOpened, setHamburgerHasBeenOpened] = useState(false);

    const [settingsIsOpen, setSettingsIsOpen] = useState(false);
    const [settingsHasBeenOpened, setSettingsHasBeenOpened] = useState(false);

    const toggleNavigation = () => {
        if (!hamburgerHasBeenOpened) setHamburgerHasBeenOpened(true);
        setHamburgerIsOpen(!hamburgerIsOpen);
    };

    const toggleSettings = () => {
        if (!settingsHasBeenOpened) setSettingsHasBeenOpened(true);
        setSettingsIsOpen(!settingsIsOpen);
    };

    const isDashboard = location.pathname === '/dashboard';
    const isHome = location.pathname === '/';

    const handleWalletDisconnect = async () => {
        await deleteUserXrplWallet();
        setIsModalOpen(false); // Close the modal
        setAccountObject((prevState) => ({ ...prevState, wallet_address: null })); // Assuming `walletConnected` is a state property
        navigate('/profile'); // Optionally navigate to a page, or refresh the component
    };

    const toggleModal = () => {
        setIsModalOpen(!isModalOpen);
    };

    return (
        <>
            <ConfirmationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onConfirm={handleWalletDisconnect} />
            <NavigationContainer>
                <NavigationHeader $isDashboard={isDashboard}>
                    {!isDashboard && !isHome ? (
                        <>
                            <LogoNavigation onClick={goBack}>{backArrowSvg}</LogoNavigation>
                        </>
                    ) : (
                        <BaseLogo>
                            <LogoNavigation onClick={goBack}>
                                <img src={logoImg} />
                            </LogoNavigation>
                            <CompanyName>Sig Verify</CompanyName>
                        </BaseLogo>
                    )}
                    <NavIconsDiv>
                        {accountObject.loggedIn ? (
                            <>
                                <SettingsButtonActivated onClick={toggleSettings} $settingsIsOpen={settingsIsOpen}>
                                    {settingsIcon}
                                </SettingsButtonActivated>
                                <HamburgerButtonActivated onClick={toggleNavigation} $hamburgerIsOpen={hamburgerIsOpen}>
                                    <HamburgerLine />
                                    <HamburgerLine />
                                    <HamburgerLine />
                                </HamburgerButtonActivated>
                            </>
                        ) : (
                            <HamburgerButtonActivated
                                onClick={toggleNavigation}
                                $hamburgerIsOpen={hamburgerIsOpen}
                                style={{ marginLeft: '18px', marginTop: '8px' }}
                            >
                                <HamburgerLine />
                                <HamburgerLine />
                                <HamburgerLine />
                            </HamburgerButtonActivated>
                        )}
                    </NavIconsDiv>
                </NavigationHeader>
                <NavigationListAnimated
                    $hamburgerIsOpen={hamburgerIsOpen}
                    $hamburgerHasBeenOpened={hamburgerHasBeenOpened}
                    onClick={toggleNavigation}
                >
                    {accountObject.loggedIn ? (
                        <>
                            {SocialsDisplay()}

                            <>
                                <NavigationItem>
                                    <NavigationLink to="/dashboard" className="buttonPop">
                                        Dashboard
                                    </NavigationLink>
                                </NavigationItem>
                                <NavigationItem>
                                    <NavigationLink to="/profile" className="buttonPop">
                                        Profile
                                    </NavigationLink>
                                </NavigationItem>
                                <NavigationItem>
                                    <NavigationLink to="/documents" className="buttonPop">
                                        Documents
                                    </NavigationLink>
                                </NavigationItem>
                                <NavigationItem>
                                    <NavigationLink to="/signatures" className="buttonPop">
                                        Signatures
                                    </NavigationLink>
                                </NavigationItem>
                                <NavigationItem>
                                    <NavigationLink to="/profile/search" className="buttonPop">
                                        Search
                                    </NavigationLink>
                                </NavigationItem>
                                <NavigationItem>
                                    <LogoutButton onClick={logoutUser} to="/" className="buttonPop">
                                        LOGOUT
                                    </LogoutButton>
                                </NavigationItem>
                            </>
                        </>
                    ) : (
                        <>
                            {SocialsDisplay()}

                            <>
                                <NavigationItem>
                                    <NavigationLink to="/" className="buttonPop">
                                        HOME
                                    </NavigationLink>
                                </NavigationItem>
                                <NavigationItem>
                                    <NavigationLink to="/profile/search" className="buttonPop">
                                        SEARCH
                                    </NavigationLink>
                                </NavigationItem>
                                <NavigationItem>
                                    <NavigationLink to="/login-user" className="buttonPop">
                                        LOGIN
                                    </NavigationLink>
                                </NavigationItem>
                                <NavigationItem>
                                    <NavigationLink to="/register-user" className="buttonPop">
                                        CREATE ACCOUNT
                                    </NavigationLink>
                                </NavigationItem>
                            </>
                        </>
                    )}
                </NavigationListAnimated>
                <SettingsListAnimated $settingsIsOpen={settingsIsOpen} $settingsHasBeenOpened={settingsHasBeenOpened}>
                    <h3>{accountObject.first_name}</h3>
                    <h2>{accountObject.email}</h2>
                    <SettingsItem>
                        <strong>Disconnect current wallet.</strong>
                        <p>After disconnecting wallet, return to profile to connect new wallet.</p>
                        <SettingsButton onClick={toggleModal} className="buttonPop">
                            Disconnect
                        </SettingsButton>
                    </SettingsItem>
                </SettingsListAnimated>
            </NavigationContainer>
        </>
    );
};

export default NavigationComponent;
