import { useContext, useEffect, useState } from 'react';
import { AccountContext } from '../../../../App';
import ProfileWelcome from './subComponents/ProfileWelcome';
import NavigationSlider from './subComponents/NavigationSlider';
import MembershipUpgradeModal from './subComponents/UpgradeMembershipModal';
import styled from 'styled-components';
import logoImg from '../../../../assets/svLogo.png';
import { getProfileData, getUserEmail } from '../../../../utils/httpRequests/routes/users';
import XamanLogin from '../../../XrplDependentComponents/XamanLogin/XamanLogin';

const ProfilePage = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    width: 100%;
    max-width: 730px;
    gap: 20px;
    padding: 0px;
    margin-top: 0px;
    z-index: 10;
`;

const GridBox = styled.div`
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
`;

const Block = styled.div`
    width: 100%;
    background-color: #ffffff9d;
    min-width: 280px;
    /* height: clamp(340px, 70vh, 90%); */
    align-items: center;
    justify-content: center;
    padding: 20px 20px;
    margin: 5px;
    font-size: 12.5px;
    position: relative;
    box-shadow: inset 2px 2px 2px 0px rgba(255, 255, 255, 0.5), 7px 7px 20px 0px rgba(0, 0, 0, 0.1), 4px 4px 5px 0px rgba(0, 0, 0, 0.1);
    border-radius: 10px;

    @media (min-width: 620px) {
        width: clamp(45%, 280px, 40vw);
    }
`;

const ProfileTierLimitsSection = styled.section`
    width: 100%;
    display: flex;
    flex-direction: column;
    background-color: white;
    padding: 12px 20px;
    border-radius: 10px;
    font-size: 0.9em;
    margin-bottom: 10px;
    box-shadow: inset 2px 2px 2px 1px rgba(59, 59, 59, 0.5), 7px 7px 20px 0px rgba(0, 0, 0, 0.1), 0px 0px 0px 0px rgba(0, 0, 0, 0.1);

    h4 {
        text-align: start;
        width: 100%;
        max-width: 360px;
        margin-bottom: 0px;
        margin-top: 0px;
        font-family: 'Exo', sans-serif;
        color: #444;
        font-size: 0.9em;
    }

    //tier level div
    & > div:first-child {
        display: flex;
        align-items: center;
        margin-bottom: 0px;
        padding: 10px;
        padding-bottom: 3px;
        width: 100%;
        justify-content: space-between;
    }
`;

const AccountTotalsSectionMainContent = styled.div`
    display: flex;
    flex-direction: column;
    padding: 10px;
    padding-top: 0px;
    background-color: none;
`;

const ContentTotal = styled.div`
    border-radius: 5px;
    display: flex;
    width: 100%;
    justify-content: flex-start;
    align-items: center;
    font-family: 'Exo', sans-serif;
    margin-bottom: 10px;

    button {
        background-color: #333;
        border: none;
        color: white;
        border-radius: 3px;
        padding: 4px 6px;
        font-size: 0.76em;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans',
            'Helvetica Neue', sans-serif;
        font-weight: 500;

        &:hover {
            background-color: #111;
            cursor: pointer;
        }
    }
`;

const ContentStatSection = styled.div`
    border-radius: 5px;
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-block: 1px;
    font-family: 'Exo', sans-serif;
    font-size: 1.4em;

    h5 {
        font-family: 'Abel', sans-serif;
        margin-block: 0px;
        font-weight: 800;
    }

    em {
        font-size: 0.75em;
        margin-left: 3px;
    }
`;

const Warning = styled.div`
    display: flex;
    flex-direction: column;
    margin-top: 10px;

    p {
        color: rgb(246, 30, 10);
        font-size: 11px;
        text-align: start;
        margin-block: 7px;
    }

    button {
        font-size: 0.9em;
        width: fit-content;
        padding: 6px 12px;
        padding-top: 8.5px;
        color: white;
        background-color: #333;
        border: none;
        border-radius: 6px;

        &:hover {
            background-color: #111;
        }
    }
`;

const XrplWalletDisplay = styled.div`
    text-align: start;
    width: 100%;
    padding: 14px 10px;
    margin-top: 15px;
    border-radius: 10px;
    box-shadow: inset 2px 2px 2px 1px rgba(59, 59, 59, 0.5), 7px 7px 20px 0px rgba(0, 0, 0, 0.1), 0px 0px 0px 0px rgba(0, 0, 0, 0.1);
    word-break: break-all;
    background-color: #c2c2c210;
    color: #333;

    @media (min-width: 420px) {
        font-size: 1.1em;
    }

    @media (min-width: 470px) {
        font-size: 1.2em;
    }

    @media (min-width: 620px) {
        font-size: 0.95em;
    }

    h2 {
        text-align: start;
        font-size: 1.1em;
        margin-bottom: 0px;
        margin-top: 0px;
        text-decoration: underline;
        padding: 2px;
    }

    strong {
        font-size: 0.82em;
        text-align: start;
        font-weight: 800;
        padding: 2px;
    }
`;

const WalletForm = styled.form`
    width: 100%;
    min-height: fit-content;
    display: flex;
    background-color: white;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 2rem;
    border-radius: 12px;
    margin-top: 2vh;
    box-shadow: 0px 6px 9px 0px #9b9b9bc9;
    font-size: 1em;
    z-index: 10;

    button {
        position: relative;
        top: -10px;
        right: -47%;
        padding: 3px 8px;
        padding-top: 5px;
        border: none;
        border-radius: 3px;
        background-color: #b44c4c;
        color: white;
    }

    label {
    }

    select {
        width: 150px;
    }

    input {
        font-size: 10px;
        width: fit-content;
        padding: 6px 12px;
        padding-top: 7px;
        color: white;
        background-color: #333;
        border: none;
        border-radius: 6px;
    }
`;

function Profile() {
    // eslint-disable-next-line no-unused-vars
    const [accountObject, setAccountObject] = useContext(AccountContext);
    const [walletAuthOpened, setWalletAuthOpened] = useState(false);
    const [showWalletProviders, setShowWalletProviders] = useState(false);
    const [selectedWalletProvider, setSelectedWalletProvider] = useState('');

    const [accountDocumentTotal, setAccountDocumentTotal] = useState(0);
    const [accountSignatureTotal, setAccountSignatureTotal] = useState(0);

    const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

    const handleWalletProviderSubmit = (event) => {
        event.preventDefault();
        const provider = event.target.walletProvider.value;

        setSelectedWalletProvider(provider);
        // Assuming we only show the XamanLogin when a provider is selected
        if (provider === 'Xaman-xrpl' || provider === 'xdc') {
            setWalletAuthOpened(true);
            // No need to show the wallet providers form anymore
            setShowWalletProviders(false);
        }
    };

    const toggleWalletProviderForm = () => {
        if (walletAuthOpened) {
            // If XamanLogin is open, close it
            setWalletAuthOpened(false);
        }
        // Toggle the visibility of wallet providers form
        setShowWalletProviders(!showWalletProviders);
    };

    const closeWalletAuthModals = () => {
        setWalletAuthOpened(false);
        setShowWalletProviders(false);
    };

    const handleUpgradeModalClose = () => {
        setIsUpgradeModalOpen(false);
    };

    const handleUpgradeButtonClick = () => {
        setIsUpgradeModalOpen(true);
    };

    // Fetch profile and email data logic
    useEffect(() => {
        console.log('Profile page detected accountObject change:', accountObject);

        const fetchProfileData = async () => {
            try {
                const profileResponse = await getProfileData();
                if (profileResponse.status !== 200) {
                    throw new Error('Profile data request failed');
                }
                const { total_documents, total_signatures } = profileResponse.data.data;
                setAccountDocumentTotal(total_documents);
                setAccountSignatureTotal(total_signatures);

                const emailResponse = await getUserEmail();
                if (emailResponse.status !== 200) {
                    throw new Error('Email data request failed');
                }
                const email = emailResponse.data.email;

                // Optional: log final fetched data
                console.log('data fetched in profile useEffect: ', {
                    profileData: profileResponse.data.data,
                    email: email,
                });
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchProfileData();
    }, [accountObject]);

    console.log('Profile page rendering...');
    return (
        <>
            {/* faded background logo */}
            <div className="backgroundLogoContainer">
                <img className="backgroundLogo" src={logoImg} />
            </div>

            <ProfilePage>
                <GridBox>
                    <Block>
                        <ProfileWelcome
                            membership={accountObject.membership?.charAt(0).toUpperCase() + accountObject.membership?.slice(1)}
                        />
                        {!accountObject.wallet_address && (
                            <>
                                <Warning>
                                    <p>WARNING! - Wallet not connected for blockchain signatures.</p>
                                    {showWalletProviders || walletAuthOpened ? (
                                        <button className="buttonPop" onClick={closeWalletAuthModals}>
                                            Close
                                        </button>
                                    ) : (
                                        <button className="buttonPop" onClick={toggleWalletProviderForm}>
                                            Connect Wallet
                                        </button>
                                    )}
                                </Warning>
                                {showWalletProviders && (
                                    <WalletForm onSubmit={handleWalletProviderSubmit}>
                                        <button className="buttonPop" onClick={() => setShowWalletProviders(!showWalletProviders)}>
                                            X
                                        </button>
                                        <label htmlFor="walletProvider">Choose a wallet provider:</label>
                                        <select name="walletProvider" id="walletProvider">
                                            <option value="Xaman-xrpl">Xaman</option>
                                            <option value="xdc">XDC</option>
                                            {/* Add more options for other wallet providers here */}
                                        </select>
                                        <br />
                                        <br />
                                        <input type="submit" value="Connect" className="buttonPop" />
                                    </WalletForm>
                                )}
                                {walletAuthOpened && selectedWalletProvider === 'Xaman-xrpl' && (
                                    <XamanLogin setWalletAuthOpened={setWalletAuthOpened} />
                                )}
                            </>
                        )}

                        {accountObject.wallet_address && (
                            <XrplWalletDisplay>
                                <h2>Authenticated Wallet:</h2>
                                <strong>{accountObject.wallet_address}</strong>
                            </XrplWalletDisplay>
                        )}
                        {/* Add logic to render the component for 'xdc' provider if selected */}
                    </Block>

                    <Block>
                        <ProfileTierLimitsSection>
                            <div>
                                <h4>Tier Level:</h4>
                                <strong>{accountObject.membership}</strong>
                            </div>
                            <AccountTotalsSectionMainContent>
                                <ContentTotal>
                                    <button className="buttonPop" onClick={handleUpgradeButtonClick}>
                                        Upgrade
                                    </button>
                                </ContentTotal>
                                <ContentStatSection>
                                    <h5>Maximum documents:</h5>
                                    <em>
                                        {accountDocumentTotal} / {accountObject.document_limit}
                                    </em>
                                </ContentStatSection>
                                <ContentStatSection>
                                    <h5>Blockchain Signatures:</h5>
                                    <em>{accountSignatureTotal}</em>
                                </ContentStatSection>
                            </AccountTotalsSectionMainContent>
                        </ProfileTierLimitsSection>
                        <NavigationSlider navigateTo="/documents" pageName="DOCUMENTS"></NavigationSlider>
                        <NavigationSlider navigateTo="/signatures" pageName="SIGNATURES"></NavigationSlider>
                    </Block>
                    <MembershipUpgradeModal isOpen={isUpgradeModalOpen} onClose={handleUpgradeModalClose} />
                </GridBox>
            </ProfilePage>
        </>
    );
}

export default Profile;
