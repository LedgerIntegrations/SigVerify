// Web2UserLogin.js
import React, { useContext, useState } from 'react';
import styles from './Web2UserLogin.module.css';
import { Link } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import logoImage from '../../assets/svLogo.png';
import { AccountContext } from '../../App';


const Web2UserLogin = () => {
    const [accountObject, setAccountObject] = useContext(AccountContext);

    const [formData, setFormData] = useState({
        Email: '',
        Password: '',
    });
    const [formErrors, setFormErrors] = useState({});
    const [isLogged, setIsLogged] = useState(false);

    const [showPassword, setShowPassword] = useState(false);
    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
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

        if (!formData.Email) errors.Email = "Email is required";
        if (!formData.Password) errors.Password = "Password is required";

        setFormErrors(errors);

        if (Object.keys(errors).length === 0) {
            try {
                const response = await fetch('http://localhost:3001/api/user/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include', // Important for cookies
                    body: JSON.stringify(formData),
                });

                const data = await response.json();


                if (response.ok) {
                    console.log("Successfully logged in!", data);
                    const userData = data.user;
                    setAccountObject({ ...userData, loggedIn: true });
                    setIsLogged(true); // Set logged in state only on success
                    // Handle successful login here (e.g., redirect, set user state, etc.)
                } else {
                    // Handle non-200 responses
                    setFormErrors({ server: data.error || 'Failed to login.' });
                }
            } catch (err) {
                console.error('Network or server error:', err);
                setFormErrors({ server: err.message || 'Failed to login due to a network or server error.' });
            }
        }
    };

    return (
        <div className={styles['user-login-page']}>
            <Link to="/" id={styles['back-link']}>← back</Link>
            <h1 id={styles['user-login-title']}>Login to Your<br /> Account</h1>
            <img id={styles["logo-image"]} src={logoImage} />

            <div className={styles['login-form-section']}>
                <h2>Login</h2>
                <div className={styles['user-login-form-container']}>
                    {isLogged ? (
                        <div className={styles['success-message']}>Logged in successfully!</div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <div className={styles['input-group']}>
                                <label>Email</label>
                                <input
                                    type="email"
                                    name="Email"
                                    value={formData.Email}
                                    onChange={handleInputChange}
                                />
                                {formErrors.Email && <span className={styles.error}>{formErrors.Email}</span>}
                            </div>
                            <div className={styles['input-group']}>
                                <label>Password</label>
                                <div className={styles['input-with-icon']}>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="Password"
                                        value={formData.Password}
                                        onChange={handleInputChange}
                                    />
                                    <span className={styles['toggle-icon']} onClick={togglePasswordVisibility}>
                                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                                    </span>
                                </div>
                                {formErrors.Password && <span className={styles.error}>{formErrors.Password}</span>}
                            </div>

                            <button type="submit">Login</button>
                            {formErrors.server && <p style={{marginTop: "10px"}}className={styles.error}>{formErrors.server}</p>}

                        </form>
                    )}
                </div>
                <div id={styles['redirect-to-create-account']}>
                    <em>Don't have an account?</em>
                    <Link to="/register-user"> Register → </Link>
                </div>
            </div>
        </div>
    );
};

export default Web2UserLogin;
