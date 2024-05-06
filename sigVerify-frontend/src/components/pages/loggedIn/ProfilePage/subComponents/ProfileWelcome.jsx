import { useContext } from 'react';
import { AccountContext } from '../../../../../App';
import styled from 'styled-components';
import useFetchAndCategorizePrivateDocuments from '../../../../../utils/hooks/useFetchAndCategorizePrivateDocuments';

const ProfileWelcomeContainer = styled.div`
    height: fit-content;
    width: 100%;
    text-align: start;
    margin-top: 0px;
`;

const WelcomeContainerIntro = styled.section`
    width: 100%;
    max-width: 360px;
`;

const WelcomeIntroTierRank = styled.p`
    background-color: white;
    border: 1px solid #908f8f;
    width: fit-content;
    padding: 5px 6px;
    padding-top: 8px;
    border-radius: 10px;
    font-size: 0.85em;
    margin: 0px;
    margin-bottom: 16.5px;
    color: #000000;
    box-shadow: inset 1px 1px 1px 1px rgba(59, 59, 59, 0.5), 2px 2px 10px 0px rgba(0, 0, 0, 0.1), 0px 0px 0px 0px rgba(0, 0, 0, 0.1);
`;

const WelcomeIntroHeader = styled.h3`
    width: 100%;
    font-size: 3em;
    font-weight: 400;
    font-family: 'Kdam Thmor Pro', sans-serif;
    margin: 0px;
    color: #666;

    strong {
        font-weight: 800;
        color: #222;
    }
`;

const WelcomeIntroMessage = styled.p`
    font-family: 'Sulphur Point', sans-serif;
    font-size: 1.4em;
    margin-top: 0px;
    margin-bottom: 10px;
    margin-left: 3px;
    color: #666;
    word-spacing: -2px;

    strong {
        color: #222;
    }
`;

const WelcomeIntroStats = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
    justify-content: start;
    color: #666;
    max-width: 360px;
    /* margin-top: 5px; */

    div {
        min-width: 68px;
        border: 1px solid white;
        border-radius: 10px;
        background-color: white;
        display: flex;
        gap: 4px;
        justify-content: center;
        align-items: center;
        padding: 3px 6px;
        padding-top: 8px;
        box-shadow: inset 2px 2px 2px 1px rgba(59, 59, 59, 0.5), 7px 7px 20px 0px rgba(0, 0, 0, 0.1), 0px 0px 0px 0px rgba(0, 0, 0, 0.1);

        p {
            font-size: 0.8em;
            margin: 0px;
            color: rgb(116, 116, 116);
        }

        span {
            font-size: 1em;
        }
    }
`;

// eslint-disable-next-line react/prop-types
function ProfileWelcome({ membership }) {
    const [accountObject] = useContext(AccountContext);

    // Use the custom hook to fetch and categorize documents
    const { received, sent, uploaded, completed, error } = useFetchAndCategorizePrivateDocuments(accountObject);

    if (error) {
        // Handle error appropriately, e.g., display an error message
        console.error('Failed to fetch or categorize documents:', error);
    }

    return (
        <ProfileWelcomeContainer>
            <WelcomeContainerIntro>
                <WelcomeIntroTierRank>{membership} Member</WelcomeIntroTierRank>
                <WelcomeIntroHeader>
                    Hello <strong>{accountObject?.first_name.charAt(0).toUpperCase() + accountObject?.first_name.slice(1)},</strong>
                </WelcomeIntroHeader>
                <WelcomeIntroMessage>
                    Welcome back to <strong>SigVerify</strong>.
                </WelcomeIntroMessage>
            </WelcomeContainerIntro>

            <WelcomeIntroStats>
                <div>
                    <span>{received.length}</span>
                    <p>Actions</p>
                </div>
                <div>
                    <span>{sent.length}</span>
                    <p>Waiting</p>
                </div>
                <div>
                    <span>{completed.length}</span>
                    <p>Completed</p>
                </div>
            </WelcomeIntroStats>
        </ProfileWelcomeContainer>
    );
}

export default ProfileWelcome;
