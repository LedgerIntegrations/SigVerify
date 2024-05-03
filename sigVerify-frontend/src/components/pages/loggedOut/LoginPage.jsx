// Web2UserLogin.js
import { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import logoImage from '../../../assets/svLogo.png';
import { AccountContext } from '../../../App';
import styled from 'styled-components';
import { ErrorMessage } from '../../component-helpers/styled-elements/CommonStyles';
import { arrayBufferToHex } from '../../../utils/encoding';

import { loginUser } from '../../../utils/httpRequests/routes/users';

const LoginPageContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    height: 100dvh;
    background-color: #141414;

`;

const BackgroundLogo = styled.img`
    height: 200px;
    width: 200px;
    position: absolute;
    top: 30%;
    opacity: 0.5;
`;

const BackArrow = styled(Link)`
    position: absolute;
    top: 30px;
    left: 30px;
    color: white;
    text-decoration: none;
`;

const LoginPageTitle = styled.h1`
    font-size: 2em;
    margin-bottom: 20px;
    color: #fff;
    text-align: start;
    width: 86vw;
    margin-top: 8vh;
    margin-top: 90px;
    z-index: 5;
`;

const LoginFormSection = styled.div`
    width: 95%;
    max-width: 800px;
    margin-bottom: 1vh;
    background-color: white;
    padding: 10px;
    padding-block: 40px;
    border-radius: 20px;
    z-index: 2;
    display: flex;
    flex-direction: column;
    align-items: center;
    opacity: 0.9;
    margin-bottom: 10px;
`;

const LoginFormContainer = styled.div`
    max-width: 450px;
    width: 95%;
    padding: 20px;
    background-color: rgba(255, 255, 255, 0.8);
    border-radius: 5px;

    label {
        display: block;
        margin-bottom: 5px;
        font-weight: bold;
        text-align: start;
        color: black;
    }

    input {
        width: 100%;
        padding: 8px;
        border: none;
        border-bottom: 1px solid rgb(156, 156, 156);
        background-color: #ffffff;
        color: #000000;
        transition: background-color 0.3s, border 0.3s;
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

        &:hover {
            background-color: #000000;
        }
    }
`;

const InputGroup = styled.div`
    margin-bottom: 20px;

    // Targeting direct child input and input inside .input-with-icon class for focus
    > input:focus,
    > .input-with-icon > input:focus {
        border-color: black;
        outline: none;
    }
`;

const InputWithIcon = styled.div`
    position: relative;
    width: 100%;

    input:focus {
        border-color: black;
        outline: none;
    }
`;

const ErrorText = styled.span`
    color: #e50914;
    font-size: 14px;
    margin-top: 5px;
`;

const SuccessText = styled.div`
    color: #4caf50;
    text-align: center;
    padding: 20px 0;
`;

const CreateAccountRedirect = styled.div`
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

const VisibilityIconToggler = styled.span`
    position: absolute;
    top: 50%;
    right: 10px;
    transform: translateY(-50%);
    cursor: pointer;
    color: #aaa;
`;

function hashPassword(password) {
    // Hashing logic...
    return new Promise((resolve, reject) => {
        // Example hashing function
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        crypto.subtle
            .digest('SHA-256', data)
            .then((hashed) => resolve(arrayBufferToHex(hashed)))
            .catch((err) => reject(err));
    });
}

const LoginPage = () => {
    // eslint-disable-next-line no-unused-vars
    const [accountObject, setAccountObject] = useContext(AccountContext);

    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [formErrors, setFormErrors] = useState({});
    const [isLogged, setIsLogged] = useState(false);

    const [showpassword, setShowpassword] = useState(false);
    const togglepasswordVisibility = () => {
        setShowpassword(!showpassword);
    };

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const errors = {};

        if (!formData.email) errors.email = 'Email is required';
        if (!formData.password) errors.password = 'Password is required.';

        setFormErrors(errors);

        if (Object.keys(errors).length === 0) {
            try {
                const hashedPassword = await hashPassword(formData.password);
                const payload = {
                    ...formData,
                    password: hashedPassword,
                };
                const response = await loginUser(payload);

                if (response.status === 200) {
                    console.log('Successfully logged in!', response.data);
                    setAccountObject({ ...response.data.user, loggedIn: true });
                    setIsLogged(true);
                } else {
                    // Parses the response to get error message
                    const data = await response.json(); // Ensure the response is parsed as JSON
                    // Set the error message from the server if available
                    setFormErrors({ server: data.error || 'Failed to login.' });
                }
            } catch (err) {
                // Checks if the error is due to an unsuccessful response or a network issue
                if (err.isAuthError && err.response) {
                    // If the error is identified as an authentication error and has a response
                    setFormErrors({ server: err.response.data.error || 'Authentication error.' });
                } else if (err.response) {
                    // If the error comes with a response, handle it
                    setFormErrors({ server: err.response.data.error || 'Failed to login.' });
                } else {
                    // If the error is not from a response, handle it as a network error
                    console.error('Network or server error:', err);
                    setFormErrors({ server: err.message || 'Failed to login due to a network or server error.' });
                }
            }
        }
    };

    return (
        <LoginPageContainer>
            <BackArrow to="/">← back</BackArrow>
            <LoginPageTitle>
                Login to Your
                <br /> Account
            </LoginPageTitle>
            <BackgroundLogo src={logoImage} />

            <LoginFormSection>
                <h2>Login</h2>
                <LoginFormContainer>
                    {isLogged ? (
                        <SuccessText>Logged in successfully!</SuccessText>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <InputGroup>
                                <label>email</label>
                                <input type="email" name="email" value={formData.email} onChange={handleInputChange} />
                                {formErrors.email && <ErrorText>{formErrors.email}</ErrorText>}
                            </InputGroup>
                            <InputGroup>
                                <label>password</label>
                                <InputWithIcon>
                                    <input
                                        type={showpassword ? 'text' : 'password'}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                    />
                                    <VisibilityIconToggler onClick={togglepasswordVisibility}>
                                        {showpassword ? <FaEyeSlash /> : <FaEye />}
                                    </VisibilityIconToggler>
                                </InputWithIcon>
                                {formErrors.password && <ErrorText>{formErrors.password}</ErrorText>}
                            </InputGroup>

                            <button type="submit">Login</button>
                            {formErrors.server && <ErrorMessage style={{ marginTop: '10px' }}>{formErrors.server}</ErrorMessage>}
                        </form>
                    )}
                </LoginFormContainer>
                <CreateAccountRedirect>
                    <em> Do not have an account?</em>
                    <Link to="/register-user"> Register → </Link>
                </CreateAccountRedirect>
            </LoginFormSection>
        </LoginPageContainer>
    );
};

export default LoginPage;
