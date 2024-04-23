import styled from 'styled-components';
import logoImg from '../../../assets/svLogo.png';
import { Link } from 'react-router-dom';
import { CgProfile } from 'react-icons/cg';
import { FaFileSignature } from 'react-icons/fa6';
import { IoDocumentOutline } from 'react-icons/io5';
import { BsFingerprint } from 'react-icons/bs';
import { RiUserSearchFill } from 'react-icons/ri';

const OutterDashboardContainer = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 100%;
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
    /* margin-inline: auto; */
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
        /* width: 90%; */
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
    /* aspect-ratio: 0.7; */
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

const ProfileLookup = styled.section`
    width: 100%;
    max-width: 490px;
    padding: 10px;
    display: flex;
    flex-direction: column;
    justify-content: start;
    align-items: start;

    input {
        max-width: 340px;
        margin-inline: 20px;
    }
`;

const documentIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
        />
    </svg>
);

const signatureIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M7.864 4.243A7.5 7.5 0 0119.5 10.5c0 2.92-.556 5.709-1.568 8.268M5.742 6.364A7.465 7.465 0 004.5 10.5a7.464 7.464 0 01-1.15 3.993m1.989 3.559A11.209 11.209 0 008.25 10.5a3.75 3.75 0 117.5 0c0 .527-.021 1.049-.064 1.565M12 10.5a14.94 14.94 0 01-3.6 9.75m6.633-4.596a18.666 18.666 0 01-2.485 5.33"
        />
    </svg>
);

const profileIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z"
        />
    </svg>
);

// const settingsIcon = (
//     <svg
//         xmlns="http://www.w3.org/2000/svg"
//         fill="none"
//         viewBox="0 0 24 24"
//         strokeWidth={1.5}
//         stroke="currentColor"
//         className="w-6 h-6"
//     >
//         <path
//             strokeLinecap="round"
//             strokeLinejoin="round"
//             d="M4.5 12a7.5 7.5 0 0015 0m-15 0a7.5 7.5 0 1115 0m-15 0H3m16.5 0H21m-1.5 0H12m-8.457 3.077l1.41-.513m14.095-5.13l1.41-.513M5.106 17.785l1.15-.964m11.49-9.642l1.149-.964M7.501 19.795l.75-1.3m7.5-12.99l.75-1.3m-6.063 16.658l.26-1.477m2.605-14.772l.26-1.477m0 17.726l-.26-1.477M10.698 4.614l-.26-1.477M16.5 19.794l-.75-1.299M7.5 4.205L12 12m6.894 5.785l-1.149-.964M6.256 7.178l-1.15-.964m15.352 8.864l-1.41-.513M4.954 9.435l-1.41-.514M12.002 12l-3.75 6.495"
//         />
//     </svg>
// );

const buttonsData = [
    { title: 'Profile', icon: <CgProfile />, link: '/profile' },
    { title: 'Documents', icon: <IoDocumentOutline />, link: '/documents' },
    { title: 'Signatures', icon: <BsFingerprint />, link: '/signatures' },
    { title: 'Search', icon: <RiUserSearchFill />, link: '/profile/search' },
    // { title: 'Settings', icon: settingsIcon, link: '/settings' },
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
                {/* <ProfileLookup>
                    <MainTitle style={{ fontSize: '1.6em' }}>Profile Lookup:</MainTitle>
                    <input type="text" placeholder="email address"></input>
                </ProfileLookup> */}
            </OutterDashboardContainer>
        </>
    );
}

export default Dashboard;
