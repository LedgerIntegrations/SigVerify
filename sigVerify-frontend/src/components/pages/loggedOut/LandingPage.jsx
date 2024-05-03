import { Link } from 'react-router-dom';
import logoImage from '../../../assets/svLogo.png';
import styled from 'styled-components';
import NavigationComponent from '../../Navigation/NavigationComponent';
import xummDl from '../../../assets/xummDl.png';
import eSignDoc from '../../../assets/eSignDoc.png';

import { RiOpenSourceFill } from 'react-icons/ri';
import { BsFillDoorOpenFill } from 'react-icons/bs';
import { GiStamper } from 'react-icons/gi';
import { GoLaw } from 'react-icons/go';
import { MdEnhancedEncryption } from 'react-icons/md';
import { CiCoinInsert } from 'react-icons/ci';
import { RiTwitterXLine } from 'react-icons/ri';
import { FaLinkedinIn } from 'react-icons/fa6';
import { SiDiscord } from 'react-icons/si';
import { SiLinktree } from 'react-icons/si';

const LandingPageContainer = styled.div`
    text-align: center;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    margin-inline: auto;
    padding-top: 115px;
    height: 100%;
    position: relative;
    overflow-x: hidden; // Prevent horizontal overflow explicitly
    overflow-y: auto; // Allow vertical scrolling if necessary
`;

const Navigation = styled(NavigationComponent)``;

const IntroSection1 = styled.div`
    width: 100%;
    z-index: 2;
    text-align: start;
    display: flex;
    flex-direction: column;
    justify-content: start;
    align-items: center;
    padding: 0px 32px;
    height: 82vh;
    min-height: 660px;

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

const CallToAction = styled.section`
    margin-bottom: 2vh;
    max-width: 580px;

    @media (min-width: 560px) {
        margin-top: 1vh;
        max-width: 800px;
    }

    @media (min-width: 860px) {
        width: 760px;
    }
`;

const CallToActionText1 = styled.p`
    color: black;
    font-family: 'Saira', sans-serif;
    margin-top: 20px;
    margin-bottom: 20px;
    font-size: 3.5em;
    word-spacing: 4px;
    line-height: 54px;
    letter-spacing: 3px;
    position: relative;
    z-index: 10;
`;

const CallToActionSmaller1 = styled.p`
    font-size: 1em;
    /* font-family: 'Teko', sans-serif; */
    margin-inline: 0px;
    margin-top: 0px;
    position: relative;
    color: #0967f4;
    z-index: 10;
`;

const RegisterButton = styled.div`
    width: 200px;
    height: 58.5px;
    position: relative;
    z-index: 2;

    a {
        display: block;

        button {
            font-family: 'Saira', sans-serif;
            padding: 18px 22px;
            margin-bottom: 12px;
            border-radius: 40px;
            border-color: transparent;
            color: white;
            background-color: rgba(46, 42, 42, 0.962);
            width: 100%;
            height: 100%;
            font-size: 1em;
            border: none;
            cursor: pointer;
            outline: none;

            &:hover {
                background-color: #2f2d2d;
                font-size: 0.94em;
            }
        }
    }
`;

const CallToActionImage = styled.section`
    img {
        padding-bottom: 10px;
        width: 500px;
        height: 420px;
        min-width: 220px;
        position: relative;
        z-index: 1;
        top: -120px;
        left: 80px;
        opacity: 1;

        @media (min-width: 860px) {
            width: 640px;
            left: 120px;
        }
    }
`;

const SectionOne = styled.section`
    background-color: #ffffff;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 100%;

    h5 {
        font-size: 20px;
        padding: 20px;
        margin-bottom: 0px;
        margin-top: 75px;

        strong {
            text-decoration: underline;
        }
    }
`;

const Benefits = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    width: 100%;
    max-width: 420px;
    min-height: 180px;
    justify-content: center;
    padding: 10px;
    margin-block: 20px;
    margin-bottom: 38px;
    gap: 10px;

    @media (min-width: 625px) {
        max-width: 600px;
        grid-template-columns: 1fr 1fr 1fr;
    }
`;

const BenefitCard = styled.div`
    display: flex;
    max-width: 190px;
    min-width: 105px;
    min-height: 121px;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
    border: 2px solid rgb(207, 205, 205);
    border-radius: 10px;
    padding: 15px 10px;
    font-size: 0.8em;
    text-align: center;

    strong {
        font-size: 12px;
    }

    svg {
        /* color: #208cf9; */
        color: #0967f4;
    }
`;

const BenefitIcon = styled.div`
    svg {
        height: 36px;
        width: 36px;
    }
`;

const SectionTwo = styled.div`
    min-height: 200px;
    padding: 20px 12px;

    h3 {
        padding: 12px;
        font-size: 20px;
    }

    img {
        width: 100%;
        max-width: 600px;
        margin-bottom: 40px;
    }
`;

const Footer = styled.footer`
    background-color: white;
    min-height: 200px;
    width: 100%;
    padding-bottom: 20px;

    section {
        a: -webkit-any-link {
            color: #7a7878;

            &:hover {
                color: black;
            }
        }
        h5 {
            font-size: 16px;
            margin-bottom: 12px;
        }
        div {
            width: 100%;
            display: flex;
            justify-content: center;
            gap: 12px;
        }
    }

    hr {
        width: 100%;
        height: 3px;
    }
`;

const FooterMain = styled.div`
    display: flex;
    justify-content: space-around;
    align-items: center;
    flex-wrap: wrap;

    #footerLogo {
        height: 64px;
        width: 64px;
        margin-block: 44px;
        margin-inline: 20px;
    }
`;

const FooterNav = styled.ul`
    text-decoration: none;
    list-style: none;
    display: flex;
    gap: 2rem;
    padding: 0px 20px;

    li {
        a: -webkit-any-link {
            color: #757575;

            &:hover {
                color: black;
            }
        }
    }
`;

const FooterSocial = styled.ul`
    text-decoration: none;
    list-style: none;
    display: flex;
    gap: 2rem;
    padding: 0px 20px;
    /* margin-block: 44px; */

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

function LandingPage() {
    const benefitDetails = [
        {
            title: 'Open source technology, freely accessible.',
            graphic: <RiOpenSourceFill />,
        },
        {
            title: 'Decentralized / transparent signature storage.',
            graphic: <BsFillDoorOpenFill />,
        },
        {
            title: 'Immutable signature finality, and data integrity.',
            graphic: <GiStamper />,
        },
        {
            title: 'Enables smart contract automation, linked to legal consent.',
            graphic: <GoLaw />,
        },
        {
            title: 'Document hash on-chain for tamper resistance.',
            graphic: <MdEnhancedEncryption />,
        },
        {
            title: 'Streamline blockchain micro-payment integration.',
            graphic: <CiCoinInsert />,
        },
    ];

    return (
        <LandingPageContainer>
            <Navigation />
            {/* <LandingLoader /> */}
            <IntroSection1 id="top">
                <CallToAction>
                    <CallToActionText1>
                        {/* Premier document signing experience, utilizing blockchain technology on the XRP Ledger. */}
                        The Smart <br /> Way to Sign...
                    </CallToActionText1>
                    <CallToActionSmaller1>
                        Enabling trustless, legally backed, consent and authorization programmability.
                    </CallToActionSmaller1>
                    <RegisterButton>
                        <Link to="/register-user">
                            <button className="buttonPop">Get Started</button>
                        </Link>
                    </RegisterButton>
                </CallToAction>
                <CallToActionImage>
                    <img src={eSignDoc} />
                </CallToActionImage>
            </IntroSection1>
            <SectionOne>
                <h5>
                    Why use <strong>Sig Verify</strong> over any other currently available platforms?
                </h5>
                <Benefits>
                    {benefitDetails.map((details, index) => (
                        <BenefitCard key={index}>
                            <strong>{details.title}</strong>
                            <BenefitIcon>{details.graphic}</BenefitIcon>
                        </BenefitCard>
                    ))}
                </Benefits>
            </SectionOne>
            <SectionTwo>
                <h3>Download XUMM to sign XRPL transaction QR codes.</h3>
                <img src={xummDl} />
            </SectionTwo>
            <Footer>
                <FooterMain>
                    <img id="footerLogo" src={logoImage} />
                    <FooterNav>
                        <li>
                            <Link to="/">Home</Link>
                        </li>
                        <li>
                            <Link to="/">About</Link>
                        </li>
                        <li>
                            <Link to="/">Team</Link>
                        </li>
                        <li>
                            <Link to="/">Contact</Link>
                        </li>
                    </FooterNav>
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
                </FooterMain>
                <hr />

                <section>
                    <h5>
                        Copyright© 2024 <Link to="/">Ledger Integrations LLC - All Rights Reserved</Link>
                    </h5>
                    <div>
                        <Link to="/">Privacy Policy</Link>
                        <Link to="/">Terms & Conditions</Link>
                    </div>
                    <p>
                        Need Help? <Link to="/">Contact Us</Link>
                    </p>
                </section>
            </Footer>
        </LandingPageContainer>
    );
}

export default LandingPage;
