import React, { useContext } from 'react';
import { AccountContext } from '../../../App';
import styled, { keyframes } from 'styled-components';

const ProfileWelcomeContainer = styled.div`
    height: fit-content;
    width: 90%;
    text-align: start;
    margin-top: 0px;
`;

const WelcomeContainerIntro = styled.section`
    width: 90%;
    max-width: 360px;
`;

const WelcomeIntroTierRank = styled.p`
    background-color: white;
    border: 1px solid #908f8f;
    width: fit-content;
    padding: 5px 6px;
    padding-top: 8px;
    border-radius: 10px;
    font-size: 12px;
    margin: 0px;
    margin-bottom: 20px;
    color: #000000;
    box-shadow: inset 1px 1px 1px 1px rgba(59, 59, 59, 0.5),
            2px 2px 10px 0px rgba(0, 0, 0, .1),
            0px 0px 0px 0px rgba(0, 0, 0, .1);
`;

const WelcomeIntroHeader = styled.h3`
    font-size: 42px;
    font-weight: 200;
    font-family: 'Kdam Thmor Pro', sans-serif;
    margin: 0px;
    margin-left: 10px;
    color: #666;

    strong {
        font-weight: 800;
        color: #222;
    }
`;

const WelcomeIntroMessage = styled.p`
    font-family: 'Sulphur Point', sans-serif;
    font-size: 16px;
    margin-top: 7px;
    margin-bottom: 5px;
    color: #666;

    strong {
        color: #222
    }
`;

const WelcomeIntroStats = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
    justify-content: start;
    color: #666;
    max-width: 360px;

    div {
        min-width: 68px;
        border: 1px solid white;
        border-radius: 10px;
        background-color: white;
        display: flex;
        gap: 5px;
        justify-content: center;
        align-items: center;
        padding: 3px 6px;
        padding-top: 8px;
        box-shadow: inset 2px 2px 2px 1px rgba(59, 59, 59, 0.5),
            7px 7px 20px 0px rgba(0, 0, 0, .1),
            0px 0px 0px 0px rgba(0, 0, 0, .1);

        p {
            font-size: 9px;
            margin: 0px;
            color: rgb(116, 116, 116);
        }

        span {
            font-size: 14px;
        }
    }
`;

function ProfileWelcome({ membership }) {
    const [accountObject, setAccountObject] = useContext(AccountContext);
    console.log(accountObject)
    return (
        <ProfileWelcomeContainer>
            <WelcomeContainerIntro>
          <WelcomeIntroTierRank>{ membership } Member</WelcomeIntroTierRank>

                <WelcomeIntroHeader>Hello <strong>{accountObject?.firstName}</strong>,</WelcomeIntroHeader>
                <WelcomeIntroMessage>welcome back to <strong>SigVerify</strong>.</WelcomeIntroMessage>
            </WelcomeContainerIntro>

              <WelcomeIntroStats>
                <div>
                  <span>5</span>
                  <p>Actions</p>
                </div>
                <div>
                  <span>5</span>
                  <p>Waiting</p>
                </div>
                <div>
                  <span>0</span>
                  <p>Expiring</p>
                </div>
              </WelcomeIntroStats>
        </ProfileWelcomeContainer>
    )
}

export default ProfileWelcome;