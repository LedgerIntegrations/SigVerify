import styled from 'styled-components';
import logoImg from '../../../assets/svLogo.png';
import { Link } from 'react-router-dom';
import { CgProfile } from 'react-icons/cg';
import { IoDocumentOutline } from 'react-icons/io5';
import { BsFingerprint } from 'react-icons/bs';
import { RiUserSearchFill } from 'react-icons/ri';

const OutterDashboardContainer = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    gap: 10px;
    padding: 0px 10px;
    margin-top: 0px;
    z-index: 10;
    max-width: 550px;
    margin-inline: auto;
`;

const DashboardSubSection = styled.section`
    width: fit-content;
    height: fit-content;
    display: flex;
    align-items: start;
    justify-content: start;
    margin-top: 1vh;
    flex-wrap: wrap;
`;

const MainTitle = styled.h1`
    color: #696969;
    width: 100%;
    max-width: 270px;
    margin-top: 6vh;
    margin-bottom: 2vh;
    text-align: start;
    font-size: 2em;
    padding-inline: 10px;
    font-family: 'Exo';

    @media (min-width: 560px) {
        max-width: 456px;
    }
`;

const DashboardNavTiles = styled.div`
    min-width: 270px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    padding: 10px;
    font-family: 'Kdam Thmor Pro', sans-serif;
    align-self: start;

    @media (min-width: 560px) {
        grid-template-columns: 1fr 1fr 1fr 1fr;
    }
`;

const DashLink = styled(Link)`
    text-decoration: none;
`;

const NeumorphicButton = styled.button`
    display: flex;
    flex-direction: column;
    width: 100%;
    min-height: 140px;
    align-items: center;
    justify-content: center;
    border: none;
    border-radius: 1rem;
    color: hsl(0, 0%, 35.68627450980392%);
    background-color: white;
    gap: 10px;
    padding: 10px;
    box-shadow: -0.5rem -0.5rem 1rem hsl(0, 0% 100% / 0.75), 0.5rem 0.5rem 1rem hsl(0, 0% 50% / 0.5);
    outline: none;
    transition: all 0.1s;
    font-size: 16px;

    &:hover,
    &:focus {
        color: hsl(0, 0%, 14.901960784313726%);
        transform: scale(1.1);
    }

    &:active {
        box-shadow: inset 0.5rem 0.5rem 1rem hsl(0, 0% 50% / 0.5), inset -0.5rem -0.5rem 1rem hsl(0, 0% 100% / 0.75);
        color: hsl(10, 80%, 50%);
    }

    @media (min-width: 560px) {
        aspect-ratio: 0.6;
        min-height: 168px;
    }
`;

const buttonsData = [
    { title: 'Profile', icon: <CgProfile />, link: '/profile' },
    { title: 'Documents', icon: <IoDocumentOutline />, link: '/documents' },
    { title: 'Signatures', icon: <BsFingerprint />, link: '/signatures' },
    { title: 'Search', icon: <RiUserSearchFill />, link: '/profile/search' },
];

function Dashboard() {
    return (
        <>
            <div className="backgroundLogoContainer">
                <img className="backgroundLogo" src={logoImg} />
            </div>
            <OutterDashboardContainer>
                <MainTitle>Dashboard</MainTitle>
                <DashboardSubSection>
                    <DashboardNavTiles>
                        {buttonsData.map((button, index) => (
                            <DashLink to={button.link} key={index}>
                                <NeumorphicButton className="buttonPop">
                                    {button.icon}
                                    <span>{button.title}</span>
                                </NeumorphicButton>
                            </DashLink>
                        ))}
                    </DashboardNavTiles>
                </DashboardSubSection>
            </OutterDashboardContainer>
        </>
    );
}

export default Dashboard;
