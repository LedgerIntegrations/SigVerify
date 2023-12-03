import React from 'react';
import { Link } from 'react-router-dom';
import logoImage from '../../assets/svLogo.png';
// import LandingLoader from '../LandingLoader/LandingLoader';
import styled from 'styled-components';

const HomepageContainer = styled.div`
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  margin-inline: auto;
  width: 100%;
  height: 100%;
  position: relative;

  a {
    text-decoration: none;
  }
`;

const TopSection = styled.div`
  width: 100%;
  z-index: 2;

  img {
    width: 150px;
    height: 150px;
    margin-top: 10vh;
    margin-inline: auto;
  }

  h2 {
    margin-top: 5vh;
    color: black;
    font-size: 1em;
    letter-spacing: 8px;
    text-transform: uppercase;
  }
`;

const CallToActionText = styled.p`
  color: black;
  font-family: 'Roboto Condensed', sans-serif;
  margin-top: 0px;
  margin-bottom: 5px;
  font-size: 2.1em;
  word-spacing: 4px;
  letter-spacing: 3px;
  line-height: 40px;
  position: relative;
  top: 40px;
`;

const CallToActionSmaller = styled.p`
  max-width: 300px;
  font-size: 0.8em;
  margin-inline: auto;
  margin-top: 0px;
  position: relative;
  top: 40px;
  color: rgb(99, 99, 99);
`;

const BottomSection = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: start;
  align-items: center;
  gap: 10px;
  height: 30vh;
  width: 100%;
  display: flex;
  margin-top: 10vh;

  a {

    button {
      padding: 12px 22px;
      border-radius: 40px;
      border-color: transparent;
      color: white;
      background-color: rgba(33, 28, 28, 0.962);
      min-width: 180px;
      font-size: 0.85em;
    }
  }
`;
function HomePage() {
    return (
        <HomepageContainer>
            {/* <LandingLoader /> */}
            <TopSection>
                <h2>Sig Verify</h2>
                <img src={logoImage} />
                <CallToActionText>Signed, Scanned, <br/> Delivered.</CallToActionText>
                <CallToActionSmaller>Premier document signing experience.</CallToActionSmaller>
            </TopSection>
            <BottomSection>
                <Link to="/login-user" >
                    <button className='buttonPop'>Sign In</button>
                </Link>
                <Link to="/register-user" >
                    <button className='buttonPop'>Create Account</button>
                </Link>
            </BottomSection>
        </HomepageContainer>
    );
}

export default HomePage;