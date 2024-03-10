// Web2UserCreate.js
import { useState, useEffect, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { FaEye, FaEyeSlash, FaCheck } from 'react-icons/fa'; // Import icons from react-icons
import logoImage from '../../../assets/svLogo.png';
import { AccountContext } from '../../../App';
import styled from 'styled-components';
import { ErrorMessage } from '../../Styles/CommonStyles';
import KeyPairGeneratorModal from '../../../utils/rsaKeyHandlers/KeyPairGeneratorModal';
import { isValidPassword } from '../../../utils/regexValidityChecks';
import { arrayBufferToHex } from '../../../utils/encoding';

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

const CreateAccountPage = () => {
    // eslint-disable-next-line no-unused-vars
    const [accountObject, setAccountObject] = useContext(AccountContext);
    const [showKeyPairModal, setShowKeyPairModal] = useState(false);
    const [publicKey, setPublicKey] = useState(null);

    const handleKeyPairGenerated = (generatedPublicKey) => {
        // Convert the public key to a format that can be sent to the server (ArrayBuffer or Base64 encoding)
        setPublicKey(generatedPublicKey);
    };

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        password: '',
        passwordConfirm: '',
        token: '',
    });

    const query = useQuery();
    console.log('url query parsed data: ', query);
    const token = query.get('token');
    if (token) {
        formData.token = token;
    }

    useEffect(() => {
        console.log('use effect firing in create-user');
    }, []);

    const [formErrors, setFormErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [validFields, setValidFields] = useState({});

    // password view toggler
    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const validateInput = (name, value) => {
        let isValid = false;
        switch (name) {
            case 'firstName':
                isValid = value.trim() !== '';
                break;
            case 'lastName':
                isValid = value.trim() !== '';
                break;
            case 'password':
                isValid = isValidPassword(value);
                break;
            case 'passwordConfirm':
                isValid = value === formData.password;
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

    // if all input form fields are valid, will toggle key generation modal which triggers new user creation when closed
    const handleSubmit = async (event) => {
        event.preventDefault();
        const errors = {};

        if (!formData.firstName) errors.firstName = 'First name is required';
        if (!formData.lastName) errors.lastName = 'Last name is required';
        if (!formData.token) errors.token = 'Auth token is required';
        if (!isValidPassword(formData.password))
            errors.password =
                'Password must be at least 8 characters, include one number, one uppercase letter, and one lowercase letter';
        if (formData.password !== formData.passwordConfirm) errors.passwordConfirm = 'Passwords do not match';

        setFormErrors(errors);

        // if (Object.keys(errors).length === 0) {
        //     setShowKeyPairModal(true); // Open the modal to generate key pair
        // }

        // Only proceed if there are no errors
        if (Object.keys(errors).length === 0) {
            // Hash the password
            const encoder = new TextEncoder();
            const data = encoder.encode(formData.password);
            crypto.subtle
                .digest('SHA-256', data)
                .then((hashed) => {
                    const hashedPassword = arrayBufferToHex(hashed); // Convert ArrayBuffer to Hex string for the hashed password

                    // Extend formData with hashed password and remove passwordConfirm field
                    setFormData((prevFormData) => {
                        const { passwordConfirm, ...rest } = prevFormData; // Destructure to remove passwordConfirm from state object
                        return {
                            ...rest,
                            password: hashedPassword,
                        };
                    });

                    setShowKeyPairModal(true); // Open the modal to generate key pair
                })
                .catch((err) => {
                    console.error('Error hashing the password', err);
                    // Handle hashing error
                });
        }
    };

    // triggers creation of new user profile when key generation modal is closed
    const handleModalClose = async () => {
        setShowKeyPairModal(false);

        if (publicKey) {
            // Add the public key to the form data
            const extendedFormData = {
                ...formData,
                publicKey: publicKey,
            };

            console.log('final extendedform data: ', extendedFormData);

            try {
                const response = await fetch('http://localhost:3001/api/user/create', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify(extendedFormData),
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
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleInputChange}
                            />
                            {formErrors.firstName && <ErrorMessage>{formErrors.firstName}</ErrorMessage>}
                        </InputGroup>
                        <InputGroup>
                            <label>Last Name</label>
                            <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} />
                            {formErrors.lastName && <ErrorMessage>{formErrors.lastName}</ErrorMessage>}
                        </InputGroup>
                        <InputGroup>
                            <label>Password</label>
                            <InputWithIcon>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={formData.password}
                                    onChange={(e) => {
                                        handleInputChange(e);
                                        validateInput(e.target.name, e.target.value);
                                    }}
                                />
                                {validFields.password && (
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
                            {formErrors.password && <ErrorMessage>{formErrors.password}</ErrorMessage>}
                        </InputGroup>
                        <InputGroup>
                            <label>Confirm Password</label>
                            <InputWithIcon>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="passwordConfirm"
                                    value={formData.passwordConfirm}
                                    onChange={(e) => {
                                        handleInputChange(e);
                                        validateInput(e.target.name, e.target.value);
                                    }}
                                />
                                {validFields.passwordConfirm && (
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
                            {formErrors.passwordConfirm && <ErrorMessage>{formErrors.passwordConfirm}</ErrorMessage>}
                        </InputGroup>

                        <button type="submit">Create User</button>
                        {formErrors.submit && <ErrorMessage>{formErrors.submit}</ErrorMessage>}
                    </form>
                </InsideFormContainer>
            </CreateUserFormContainer>
            {showKeyPairModal && (
                <KeyPairGeneratorModal onClose={handleModalClose} onKeyPairGenerated={handleKeyPairGenerated} />
            )}
        </CreateUserContainer>
    );
};

export default CreateAccountPage;
