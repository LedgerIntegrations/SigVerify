// Web2UserCreate.js
import { useState, useEffect, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { FaEye, FaEyeSlash, FaCheck } from 'react-icons/fa'; // Import icons from react-icons
import logoImage from '../../../assets/svLogo.png';
import { AccountContext } from '../../../App';
import styled from 'styled-components';
import { ErrorMessage } from '../../Styles/CommonStyles';

//TODO: When registering a email that already exists the error message shown to use is "Request failed with status code 400", need to make message more detailed for user.
const CreateUserContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    height: 100vh;
    background-color: #141414;
`;

const MainTitle = styled.h1`
    font-size: 2em;
    margin-bottom: 20px;
    color: #fff;
    text-align: start;
    width: 86vw;
    margin-top: 8vh;
`;

const BackgroundLogo = styled.img`
    height: 200px;
    width: 200px;
    position: absolute;
    top: 30%;
    opacity: 0.5;
`;

const CreateUserFormContainer = styled.div`
    max-width: 500px;
    width: 95%;
    margin-bottom: 1vh;
    background-color: white;
    opacity: 0.9;
    padding: 10px;
    padding-block: 40px;
    border-radius: 20px;
    z-index: 20;

    display: flex;
    flex-direction: column;
    align-items: center;
`;

const InsideFormContainer = styled.div`
    max-width: 450px;
    width: 95%;
    padding: 20px;
    background-color: rgba(255, 255, 255, 0.8);
    border-radius: 5px;

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
`;

const InputWithIcon = styled.div`
    position: relative;
    width: 100%;

    input:focus {
        border-color: black;
        outline: none;
    }
`;

const ToggleIcon = styled.span`
    position: absolute;
    top: 50%;
    right: 10px;
    transform: translateY(-50%);
    cursor: pointer;
    color
`;


const useQuery = () => {
    return new URLSearchParams(useLocation().search);
};

// Utility function for email validation
const isValidEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return emailRegex.test(email);
};

// Utility function for password validation (at least 8 characters, at least one number, one uppercase letter, one lowercase letter)
const isValidPassword = (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return passwordRegex.test(password);
};

const CreateAccountPage = () => {
    // eslint-disable-next-line no-unused-vars
    const [accountObject, setAccountObject] = useContext(AccountContext);

    const [formData, setFormData] = useState({
        FirstName: '',
        LastName: '',
        Password: '',
        PasswordConfirm: '',
        Token: '',
    });

    const query = useQuery();
    const token = query.get('token');
    if (token) {
        formData.Token = token;
    }

    useEffect(() => {
        console.log('use effect firing in create-user');
    }, []);

    const [formErrors, setFormErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [validFields, setValidFields] = useState({});

    //helper functions
    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const validateInput = (name, value) => {
        let isValid = false;
        switch (name) {
            case 'FirstName':
            case 'LastName':
                isValid = value.trim() !== '';
                break;
            case 'Email':
                isValid = isValidEmail(value);
                break;
            case 'Password':
                isValid = isValidPassword(value);
                break;
            case 'PasswordConfirm':
                isValid = value === formData.Password;
                break;
            default:
                break;
        }
        setValidFields({ ...validFields, [name]: isValid });
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

        if (!formData.FirstName) errors.FirstName = 'First name is required';
        if (!formData.LastName) errors.LastName = 'Last name is required';
        if (!formData.Token) errors.Token = 'Auth token is required';
        if (!isValidPassword(formData.Password))
            errors.Password =
                'Password must be at least 8 characters, include one number, one uppercase letter, and one lowercase letter';
        if (formData.Password !== formData.PasswordConfirm) errors.PasswordConfirm = 'Passwords do not match';

        setFormErrors(errors);

        if (Object.keys(errors).length === 0) {
            try {
                const response = await fetch('http://localhost:3001/api/user/create', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify(formData),
                });

                const data = await response.json();

                if (response.ok) {
                    console.log('Successfully created a user!', data);
                    const userData = data.user;

                    setAccountObject({ ...userData, loggedIn: true });
                } else {
                    // Handle non-200 responses
                    setFormErrors({
                        server:
                            data.error ||
                            'Failed to create user, try clicking authentication link from email again or re-registering..',
                    });
                }
            } catch (err) {
                console.error('Network or server error:', err);
                setFormErrors({ server: err.message || 'Failed to create user due to a network or server error.' });
            }
        }
    };

    return (
        <CreateUserContainer>
            {/* <Link to="/" id={styles['back-link']}>← back</Link> */}
            <MainTitle>
                Create Your <br />
                Account
            </MainTitle>
            <BackgroundLogo src={logoImage} />
            <CreateUserFormContainer>
                <InsideFormContainer>
                    <form onSubmit={handleSubmit}>
                        <InputGroup>
                            <label>First Name</label>
                            <input
                                type="text"
                                name="FirstName"
                                value={formData.FirstName}
                                onChange={handleInputChange}
                            />
                            {formErrors.FirstName && <ErrorMessage>{formErrors.FirstName}</ErrorMessage>}
                        </InputGroup>
                        <InputGroup>
                            <label>Last Name</label>
                            <input type="text" name="LastName" value={formData.LastName} onChange={handleInputChange} />
                            {formErrors.LastName && <ErrorMessage>{formErrors.LastName}</ErrorMessage>}
                        </InputGroup>
                        <InputGroup>
                            <label>Password</label>
                            <InputWithIcon>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="Password"
                                    value={formData.Password}
                                    onChange={(e) => {
                                        handleInputChange(e);
                                        validateInput(e.target.name, e.target.value);
                                    }}
                                />
                                {validFields.Password && (
                                    <FaCheck
                                        style={{
                                            color: 'green',
                                            right: '30px',
                                            cursor: 'pointer',
                                            top: '50%',
                                            position: 'absolute',
                                            transform: 'translateY(-50%)',
                                        }}
                                    />
                                )}
                                <ToggleIcon onClick={togglePasswordVisibility}>
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </ToggleIcon>
                            </InputWithIcon>
                            {formErrors.Password && <ErrorMessage>{formErrors.Password}</ErrorMessage>}
                        </InputGroup>
                        <InputGroup>
                            <label>Confirm Password</label>
                            <InputWithIcon>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="PasswordConfirm"
                                    value={formData.PasswordConfirm}
                                    onChange={(e) => {
                                        handleInputChange(e);
                                        validateInput(e.target.name, e.target.value);
                                    }}
                                />
                                {validFields.PasswordConfirm && (
                                    <FaCheck
                                        style={{
                                            color: 'green',
                                            right: '30px',
                                            cursor: 'pointer',
                                            top: '50%',
                                            position: 'absolute',
                                            transform: 'translateY(-50%)',
                                        }}
                                    />
                                )}
                                <ToggleIcon onClick={togglePasswordVisibility}>
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </ToggleIcon>
                            </InputWithIcon>
                            {formErrors.PasswordConfirm && <ErrorMessage>{formErrors.PasswordConfirm}</ErrorMessage>}
                        </InputGroup>

                        <button type="submit">Create User</button>
                        {formErrors.submit && <ErrorMessage>{formErrors.submit}</ErrorMessage>}
                    </form>
                </InsideFormContainer>
            </CreateUserFormContainer>
        </CreateUserContainer>
    );
};

export default CreateAccountPage;
