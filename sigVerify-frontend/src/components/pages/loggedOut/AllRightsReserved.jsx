import styled from 'styled-components';
import logoImg from '../../../assets/svLogo.png';
import { Link } from 'react-router-dom';
Link;
// Styled components
const PageContainer = styled.div`
    width: 90%;
    height: 100%;
    display: flex;
    flex-wrap: wrap;
    flex-direction: column;
    padding: 0px;
    max-width: 720px;
    margin-inline: auto;
    z-index: 10;
`;

const LogoLink = styled(Link)`
    position: absolute;
    top: 24px;
    left: 20px;
    img {
        height: 40px;
        width: 40px;
    }
`;

const Header = styled.header`
    h3 {
        margin-top: 38px;
        margin-bottom: 34px;
    }
`;

const Content = styled.div`
    background-color: #21212139;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    padding: 20px;
    margin: 20px;
    max-width: 600px;
    width: 100%;
    margin-inline: auto;
    text-align: start;

    @media (max-width: 768px) {
        padding: 15px;
    }
`;

const Title = styled.h1`
    color: #777;
    font-size: 24px;
    text-align: center;
    margin-bottom: 20px;
`;

const Text = styled.p`
    color: #ffffff;
    font-size: 16px;
    line-height: 1.6;
    margin-inline: 12px;
    padding-left: 18px;

    @media (max-width: 768px) {
        font-size: 15px;
    }
`;

// Component
const RightsReservedPage = () => {
    return (
        <>
            <div className="backgroundLogoContainer">
                <img className="backgroundLogo" src={logoImg} />
            </div>
            <PageContainer>
                <Header>
                    <Title>All Rights Reserved</Title>

                    <LogoLink to="/">
                        <img src={logoImg} alt="SigVerify Logo" />
                    </LogoLink>
                </Header>
                <Content>
                    <Text>
                        All intellectual property rights, including copyrights, trademarks rights and database rights with respect to the
                        information, texts, images, logos, photographs and illustrations on the SigVerify.com website and with respect to
                        the layout and design of the website are protected by intellectual property rights and belong to Ledger Integrations
                        or entitled third parties. The reproduction or making available in any way or form of the contents of the website
                        without prior written consent from Ledger Integrations is not allowed.
                    </Text>
                </Content>
            </PageContainer>
        </>
    );
};

export default RightsReservedPage;
