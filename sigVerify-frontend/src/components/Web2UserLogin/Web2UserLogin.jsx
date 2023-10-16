// Web2UserLogin.js
import React, { useState } from 'react';
import styles from './Web2UserLogin.module.css';
import { Link } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import logoImage from '../Navigation/assets/svLogo.png';

const Web2UserLogin = () => {
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
            // Actual login logic will go here
            // For now, we'll just simulate a successful login
            console.log("login form data: ", formData);
            setIsLogged(true);
        }
    };

    return (
        <div className={styles['user-login-page']}>
            <Link to="/" id={styles['back-link']}>← back</Link>
            <h1 id={styles['user-login-title']}>Login to Your Account</h1>
            <img id={styles["logo-image"]} src={logoImage} />

            <div className={styles['login-form-section']}>
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
                        </form>
                    )}
                </div>
                <div id={styles['redirect-to-create-account']}>
                    <em>Don't have an account?</em>
                    <Link to="/create-user"> Create one → </Link>
                </div>
            </div>
        </div>
    );
};

export default Web2UserLogin;
