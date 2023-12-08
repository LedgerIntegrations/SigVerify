import React, { useContext, useEffect, useState } from 'react';
import { AccountContext } from '../../App';
import ProfileWelcome from './ProfileSubComponents/ProfileWelcome';
import NavigationSlider from './ProfileSubComponents/NavigationSlider';
import styled from 'styled-components';
import logoImg from '../../assets/svLogo.png';

import XummLogin from '../XrplDependentComponents/XummLogin/XummLogin';

const ProfilePage = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    width: 100%;
    gap: 20px;
    padding: 0px 40px;
    margin-top: 40px;
    z-index: 10;
`;

const Block = styled.div`
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: start;
    gap: 10px;
`;

const ProfileTierLimits = styled.section`
    width: 95%;
    height: fit-content;
    display: flex;
    flex-direction: column;
    align-items: start;
    max-width: 250px;
`;

const ProfileIntroWithWalletConnect = styled.section`
    width: 95%;
    height: fit-content;
    display: flex;
    flex-direction: column;
    align-items: start;
    max-width: 250px;
`;

const ProfileTierLimitsSection = styled.section`
    width: 100%;
    display: flex;
    flex-direction: column;
    background-color: white;
    padding: 18px 20px;
    border-radius: 10px;
    font-size: 0.8em;
    box-shadow: inset 2px 2px 2px 1px rgba(59, 59, 59, 0.5), 7px 7px 20px 0px rgba(0, 0, 0, 0.1),
        0px 0px 0px 0px rgba(0, 0, 0, 0.1);

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
    margin-bottom: 20px;

    button {
        background-color: #333;
        border: none;
        color: white;
        border-radius: 3px;
        padding: 4px 6px;
        font-size: 8px;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell,
            'Open Sans', 'Helvetica Neue', sans-serif;
        font-weight: 500;

        &:hover {
            background-color: #111;
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
    font-size: 1em;

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
        font-size: 10px;
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
    background-color: white;
    text-align: start;
    min-width: 250px;
    max-width: 540px;
    width: 90%;
    height: 200px;
    border-radius: 20px;
    box-shadow: inset 2px 2px 2px 1px rgba(59, 59, 59, 0.5), 7px 7px 20px 0px rgba(0, 0, 0, 0.1),
        0px 0px 0px 0px rgba(0, 0, 0, 0.1);

    h2 {
        text-align: start;
        margin: 20px 30px;
        margin-bottom: 0px;
    }

    em {
      font-size: 9px;
      margin: 0px 30px;
      text-align: start;
    }
`;

function Profile() {
    const [accountObject, setAccountObject] = useContext(AccountContext);
    const [walletAuthOpened, setWalletAuthOpened] = useState(false);
    const [maxDocuments, setMaxDocuments] = useState(0);
    const [maxSignatures, setMaxSignatures] = useState(0);

    // Switch statement to set limits based on membership
    useEffect(() => {
        switch (accountObject.membership) {
            case 'free':
                setMaxDocuments(5);
                setMaxSignatures(10);
                break;
            case 'standard':
                setMaxDocuments(50);
                setMaxSignatures(100);
                break;
            case 'premium':
                setMaxDocuments(Infinity); // Use Infinity for unlimited
                setMaxSignatures(Infinity);
                break;
            default:
                setMaxDocuments(0);
                setMaxSignatures(0);
        }
    }, [accountObject.membership]);

    console.log('account object in profile page: ', accountObject);
    return (
        <>
            {/* faded background logo */}
            <div className="backgroundLogoContainer">
                <img className="backgroundLogo" src={logoImg} />
            </div>

            <ProfilePage>
                <Block>
                    <ProfileIntroWithWalletConnect>
                        <ProfileWelcome
                            membership={
                                accountObject.membership?.charAt(0).toUpperCase() + accountObject.membership?.slice(1)
                            }
                        />
                        {!accountObject.verifiedXrplWalletAddress && (
                            <Warning>
                                <p>WARNING! - XRPL Wallet not connected for blockchain signatures.</p>
                                <button
                                    className="buttonPop"
                                    onClick={() => {
                                        setWalletAuthOpened(!walletAuthOpened);
                                    }}
                                >
                                    {walletAuthOpened ? 'Close Auth' : 'Connect Wallet'}
                                </button>
                            </Warning>
                        )}

                        {walletAuthOpened && <XummLogin setWalletAuthOpened={setWalletAuthOpened} />}
                    </ProfileIntroWithWalletConnect>

                    <ProfileTierLimits>
                        <ProfileTierLimitsSection>
                            <div>
                                <h4>Tier Level:</h4>
                                <strong>{accountObject.membership}</strong>
                            </div>
                            <AccountTotalsSectionMainContent>
                                <ContentTotal>
                                    <button className="buttonPop">Upgrade</button>
                                </ContentTotal>
                                <ContentStatSection>
                                    <h5>Maximum documents:</h5>
                                    <em>
                                        {accountObject.totalDocuments} / {maxDocuments}
                                    </em>
                                </ContentStatSection>
                                <ContentStatSection>
                                    <h5>Blockchain Signatures:</h5>
                                    {/* TODO: add max membership level signatures dynamically*/}
                                    <em>
                                        {accountObject.totalSignatures} / {maxSignatures}
                                    </em>
                                </ContentStatSection>
                            </AccountTotalsSectionMainContent>
                        </ProfileTierLimitsSection>
                        <NavigationSlider navigateTo="/documents" pageName="documents"></NavigationSlider>
                    </ProfileTierLimits>
                </Block>
                <Block>
                    {accountObject.verifiedXrplWalletAddress && (
                        <XrplWalletDisplay>
                            <h2>Wallet</h2>
                            <em>{accountObject.verifiedXrplWalletAddress}</em>
                        </XrplWalletDisplay>
                    )}
                </Block>
            </ProfilePage>
        </>
    );
}

export default Profile;
