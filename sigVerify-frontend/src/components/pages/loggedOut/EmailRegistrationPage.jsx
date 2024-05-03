import { useState } from 'react';
import { Link } from 'react-router-dom';
import logoImage from '../../../assets/svLogo.png';
import LoadingIcon from '../../component-helpers/components/LoadingIcon';
import styled from 'styled-components';

import { registerUser } from '../../../utils/httpRequests/routes/users';

// TODO: when valid email entered and register button clicked "Email registered! Authentication e-mail sent to: lollylol123@gmail.com ." appears in color: red

const RegisterEmailPage = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    height: 100dvh;
    width: 100%;
    background-color: #141414;
`;

const BackArrow = styled(Link)`
    position: absolute;
    top: 30px;
    left: 30px;
    color: white;
    text-decoration: none;
`;

const MainTitle = styled.h2`
    font-size: 2em;
    margin-bottom: 20px;
    color: #fff;
    text-align: start;
    width: 86vw;
    margin-top: 90px;
    z-index: 2;
`;

const EmailInputContainer = styled.div`
    padding: 10px;
    width: 95%;
    min-height: 300px;
    max-width: 800px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 15px;
    background-color: white;
    border-radius: 20px;
    margin-bottom: 1vh;
    z-index: 10;
    opacity: 0.9;

    h2 {
        margin-top: 5vh;
    }

    button {
        display: block;
        width: 80%;
        padding: 12px;
        margin-inline: auto;
        background-color: #424141;
        color: #fff;
        border: none;
        border-radius: 20px;
        cursor: pointer;
        font-size: 16px;
        transition: background-color 0.3s;
        max-width: 300px;

        &:hover {
            background-color: #000000;
        }
    }
`;

const EmailInput = styled.input`
    width: 100%;
    padding: 8px;
    border: none;
    border-bottom: 1px solid rgb(156, 156, 156);
    background-color: #ffffff;
    color: #000000;
    transition: background-color 0.3s, border 0.3s;
    max-width: 300px;

    &:focus {
        border-color: black;
        outline: none;
        border-bottom: 1px solid black;
    }
`;

const BackgroundLogo = styled.img`
    height: 200px;
    width: 200px;
    position: absolute;
    top: 30%;
    opacity: 0.5;
`;

const SignInRedirect = styled.div`
    margin-top: 15px;

    em {
        margin-right: 5px;
        color: gray;
    }

    a {
        color: #000000;
        text-decoration: none;

        &:hover {
            text-decoration: underline;
        }
    }
`;

function EmailRegistrationPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [currentMessage, setCurrentMessage] = useState('');

    // Simple email validation using regex
    const isValidEmail = (email) => {
        const regex = /^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$/;
        return regex.test(email);
    };

    const handleSubmit = async () => {
        if (!isValidEmail(email)) {
            setError('Please enter a valid email address.');
            return;
        }
        // Clear any previous errors
        setError('');

        setIsLoading(true);

        try {
            const response = await registerUser(email);
            console.log(response);
            const { emailSent, message } = response.data;

            if (!emailSent) {
                throw new Error(message || 'Failed to register.');
            }

            setCurrentMessage(message);
            console.log('Email submitted:', email);
        } catch (err) {
            setError(err.message || 'Failed to register.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <RegisterEmailPage>
            <BackArrow to="/">← back</BackArrow>
            <MainTitle>
                Register Your <br />
                E-mail
            </MainTitle>
            <BackgroundLogo src={logoImage} />

            <EmailInputContainer>
                <h2>Register Email</h2>
                <EmailInput type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" />
                <button className={isLoading ? 'loading' : ''} disabled={isLoading} onClick={handleSubmit}>
                    {isLoading ? <LoadingIcon /> : ''}
                    Register
                </button>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                {currentMessage && (
                    <p style={{ color: 'green', maxWidth: '310px', fontSize: '.9em', textAlign: 'start' }}>{currentMessage}</p>
                )}
                <SignInRedirect>
                    <em>Already have an acccount?</em>
                    <Link to="/login-user"> Sign in → </Link>
                </SignInRedirect>
            </EmailInputContainer>
        </RegisterEmailPage>
    );
}

export default EmailRegistrationPage;
