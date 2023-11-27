import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
// import { StyledToggler } from '../styledComponents/TogglerButton';
import TogglerButton from '../styledComponents/TogglerButton';

import logoImg from '../../assets/svLogo.png';

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
    flex-direction: column;
    padding: 10px;
    height: 10vh;
    z-index: 20;
`;

const NavigationHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-inline: 10px;
`;

const CompanyName = styled.h4`
    margin-top: 3vh;
    margin-bottom: 0px;
    color: black;
    font-size: .8em;
    letter-spacing: 5px;
    text-transform: uppercase;
`;

const NavigationMobileHamburger = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 3px;
    height: 36px;
    padding: 7px 10px;
    margin-right: 10px;
    // border: 1px solid black;
    border-radius: 10px;
    background-color: white;
`;

const NavigationList = styled.ul`
    width: 100%;
    background-color: rgb(236, 235, 235, .93);
    list-style: none;
    display: flex;
    gap: 5px;
    flex-direction: column;
    align-items: center;
    margin: 0px;
    padding-block: 40px;
    padding-inline: 0px;
    flex-grow: 1;
    position: absolute;
    top: 100px;
    left: 0px;
    z-index: 30;
    transform: translateX(-100%);
    `;

const NavigationListAnimated = styled(NavigationList)`
  animation: ${props => props.isOpen ? slideIn : (props.hasBeenOpened ? slideOut : 'none')} 0.5s forwards;
`;

const HamburgerButtonActivated = styled(NavigationMobileHamburger)`
    box-shadow: ${props => props.isOpen ?
        `inset 2px 2px 2px 1px rgba(59, 59, 59, 0.5),
       7px 7px 20px 0px rgba(0, 0, 0, .1),
       0px 0px 0px 0px rgba(0, 0, 0, .1)`:
        `inset 2px 2px 2px 0px rgba(255, 255, 255, .5),
       7px 7px 20px 0px rgba(0, 0, 0, .1),
       4px 4px 5px 0px rgba(0, 0, 0, .1)`
    };

    color: ${props => props.isOpen ? '#333' : '#666'};


    &:hover {
        color: #333 ;
    }
`;


const NavigationItem = styled.li`
    display: flex;
    flex-direction: column;
    align-items: center; // This will vertically center the link within the list item
    border: 1px solid black;
    border-radius: 10px;
    margin-inline: 10px;
    width: 90%;
    max-width: 420px;
    font-size: 14px;
    padding: 10px 20px;
    text-align: start;
    background-color: white;
    box-shadow:
        inset 2px 2px 2px 1px rgba(59, 59, 59, 0.5),
       7px 7px 20px 0px rgba(0, 0, 0, .1),
       0px 0px 0px 0px rgba(0, 0, 0, .1);

    section {
        display: flex;
        align-items: center;
        width: 100%;
        justify-content: space-between;
    }

    p {
        margin-top: 5px;
        margin-bottom: 5px;
        font-size: 10px;
        color: #666;
    }
`;

const SocialMediaBox = styled.div`
    display: flex;
    margin: 5px;
    padding: 10px 20px;
    // border: solid 2px black;
    border-radius: 20px;
    gap: 20px;
    box-shadow: inset 2px 2px 2px 1px rgba(59, 59, 59, 0.5),
    7px 7px 20px 0px rgba(0, 0, 0, .1),
    0px 0px 0px 0px rgba(0, 0, 0, .1);
`;

const SocialMediaLink = styled.a`
 
    svg {
        width: 18px;
        height: 18px;
        color: #222;

        &:hover {
            color: #666
        }
    }  
`;

const LogoNavigation = styled(Link)`
    width: fit-content;
    height: fit-content;
    padding: 8px;
   svg {
    height: 50px;
    width: 50px;
    color: #777;

    &:hover {
        color: #555;
    }
   }
`;

const twitterSvg = (
    <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="100" height="100" viewBox="0 0 50 50" stroke="currentColor" fill="currentColor">
        <path d="M 6.9199219 6 L 21.136719 26.726562 L 6.2285156 44 L 9.40625 44 L 22.544922 28.777344 L 32.986328 44 L 43 44 L 28.123047 22.3125 L 42.203125 6 L 39.027344 6 L 26.716797 20.261719 L 16.933594 6 L 6.9199219 6 z"></path>
    </svg>
);

const linkedInSvg = (
    <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="100" height="100" viewBox="0 0 50 50" stroke="currentColor" fill="currentColor">
        <path d="M41,4H9C6.24,4,4,6.24,4,9v32c0,2.76,2.24,5,5,5h32c2.76,0,5-2.24,5-5V9C46,6.24,43.76,4,41,4z M17,20v19h-6V20H17z M11,14.47c0-1.4,1.2-2.47,3-2.47s2.93,1.07,3,2.47c0,1.4-1.12,2.53-3,2.53C12.2,17,11,15.87,11,14.47z M39,39h-6c0,0,0-9.26,0-10 c0-2-1-4-3.5-4.04h-0.08C27,24.96,26,27.02,26,29c0,0.91,0,10,0,10h-6V20h6v2.56c0,0,1.93-2.56,5.81-2.56 c3.97,0,7.19,2.73,7.19,8.26V39z"></path>
    </svg>
);

const discordSvg = (
    <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="100" height="100" viewBox="0 0 50 50" stroke="currentColor" fill="currentColor">
        <path d="M 41.625 10.769531 C 37.644531 7.566406 31.347656 7.023438 31.078125 7.003906 C 30.660156 6.96875 30.261719 7.203125 30.089844 7.589844 C 30.074219 7.613281 29.9375 7.929688 29.785156 8.421875 C 32.417969 8.867188 35.652344 9.761719 38.578125 11.578125 C 39.046875 11.867188 39.191406 12.484375 38.902344 12.953125 C 38.710938 13.261719 38.386719 13.429688 38.050781 13.429688 C 37.871094 13.429688 37.6875 13.378906 37.523438 13.277344 C 32.492188 10.15625 26.210938 10 25 10 C 23.789063 10 17.503906 10.15625 12.476563 13.277344 C 12.007813 13.570313 11.390625 13.425781 11.101563 12.957031 C 10.808594 12.484375 10.953125 11.871094 11.421875 11.578125 C 14.347656 9.765625 17.582031 8.867188 20.214844 8.425781 C 20.0625 7.929688 19.925781 7.617188 19.914063 7.589844 C 19.738281 7.203125 19.34375 6.960938 18.921875 7.003906 C 18.652344 7.023438 12.355469 7.566406 8.320313 10.8125 C 6.214844 12.761719 2 24.152344 2 34 C 2 34.175781 2.046875 34.34375 2.132813 34.496094 C 5.039063 39.605469 12.972656 40.941406 14.78125 41 C 14.789063 41 14.800781 41 14.8125 41 C 15.132813 41 15.433594 40.847656 15.621094 40.589844 L 17.449219 38.074219 C 12.515625 36.800781 9.996094 34.636719 9.851563 34.507813 C 9.4375 34.144531 9.398438 33.511719 9.765625 33.097656 C 10.128906 32.683594 10.761719 32.644531 11.175781 33.007813 C 11.234375 33.0625 15.875 37 25 37 C 34.140625 37 38.78125 33.046875 38.828125 33.007813 C 39.242188 32.648438 39.871094 32.683594 40.238281 33.101563 C 40.601563 33.515625 40.5625 34.144531 40.148438 34.507813 C 40.003906 34.636719 37.484375 36.800781 32.550781 38.074219 L 34.378906 40.589844 C 34.566406 40.847656 34.867188 41 35.1875 41 C 35.199219 41 35.210938 41 35.21875 41 C 37.027344 40.941406 44.960938 39.605469 47.867188 34.496094 C 47.953125 34.34375 48 34.175781 48 34 C 48 24.152344 43.785156 12.761719 41.625 10.769531 Z M 18.5 30 C 16.566406 30 15 28.210938 15 26 C 15 23.789063 16.566406 22 18.5 22 C 20.433594 22 22 23.789063 22 26 C 22 28.210938 20.433594 30 18.5 30 Z M 31.5 30 C 29.566406 30 28 28.210938 28 26 C 28 23.789063 29.566406 22 31.5 22 C 33.433594 22 35 23.789063 35 26 C 35 28.210938 33.433594 30 31.5 30 Z"></path>
    </svg>
);

const backArrowSvg = (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4.5 12L9.5 7M4.5 12L9.5 17M4.5 12L14.5 12C16.1667 12 19.5 13 19.5 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const gearSvg = (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.107-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>

);

const SecondNavigationComponent = () => {

    const navigate = useNavigate();

    const goBack = () => {
        navigate(-1);
    };

    const [isOpen, setIsOpen] = useState(false);
    const [hasBeenOpened, setHasBeenOpened] = useState(false);

    const toggleNavigation = () => {
        if (!hasBeenOpened) setHasBeenOpened(true);
        setIsOpen(!isOpen);
    };

    return (
        <NavigationContainer>
            <NavigationHeader>
                <LogoNavigation onClick={goBack}>
                    {backArrowSvg}
                </LogoNavigation>
                <div>
                    <CompanyName>Sig Verify</CompanyName>
                    <SocialMediaBox>
                        <SocialMediaLink>
                            {twitterSvg}
                        </SocialMediaLink>
                        <SocialMediaLink>
                            {linkedInSvg}
                        </SocialMediaLink>
                        <SocialMediaLink>
                            {discordSvg}
                        </SocialMediaLink>
                    </SocialMediaBox>
                </div>

                <HamburgerButtonActivated onClick={toggleNavigation} isOpen={isOpen} >
                    {gearSvg}
                </HamburgerButtonActivated>
            </NavigationHeader>
            <NavigationListAnimated isOpen={isOpen} hasBeenOpened={hasBeenOpened}>
                <NavigationItem>
                    <section>
                        <strong>Allow current location.</strong>
                        <TogglerButton />
                    </section>
                    <p>Lorem ipsum dolor sit amet consectetur, adipisicing elit. Doloremque, molestiae!</p>
                </NavigationItem>
                <NavigationItem>
                    <section>
                        <strong>Allow current location.</strong>
                        <TogglerButton />
                    </section>
                    <p>Lorem ipsum dolor sit amet consectetur, adipisicing elit. Doloremque, molestiae!</p>
                </NavigationItem>
                <NavigationItem>
                    <section>
                        <strong>Allow current location.</strong>
                        <TogglerButton />
                    </section>
                    <p>Lorem ipsum dolor sit amet consectetur, adipisicing elit. Doloremque, molestiae!</p>
                </NavigationItem>
                <NavigationItem>
                    <section>
                        <strong>Allow current location.</strong>
                        <TogglerButton />
                    </section>
                    <p>Lorem ipsum dolor sit amet consectetur, adipisicing elit. Doloremque, molestiae!</p>
                </NavigationItem>
                <NavigationItem>
                    <section>
                        <strong>Allow current location.</strong>
                        <TogglerButton />
                    </section>
                    <p>Lorem ipsum dolor sit amet consectetur, adipisicing elit. Doloremque, molestiae!</p>
                </NavigationItem>
                <NavigationItem>
                    <section>
                        <strong>Allow current location.</strong>
                        <TogglerButton />
                    </section>
                    <p>Lorem ipsum dolor sit amet consectetur, adipisicing elit. Doloremque, molestiae!</p>
                </NavigationItem>

            </NavigationListAnimated>

        </NavigationContainer>
    )
}

export default SecondNavigationComponent;