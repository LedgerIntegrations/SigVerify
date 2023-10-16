// Web2UserCreate.js
import React, { useState } from 'react';
import styles from './Web2UserCreate.module.css';
import { Link } from 'react-router-dom';
import { FaEye, FaEyeSlash, FaCheck } from 'react-icons/fa';  // Import icons from react-icons

// Utility function for email validation
const isValidEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return emailRegex.test(email);
};

// Utility function for password validation (at least 8 characters, at least one number, one uppercase letter, one lowercase letter)
const isValidPassword = (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
    return passwordRegex.test(password);
};

const Web2UserCreate = () => {
    const [formData, setFormData] = useState({
        FirstName: '',
        LastName: '',
        Email: '',
        Password: '',
        PasswordConfirm: '',
    });
    const [formErrors, setFormErrors] = useState({});
    const [isSubmitted, setIsSubmitted] = useState(false);

    const [showPassword, setShowPassword] = useState(false);
    const [validFields, setValidFields] = useState({});

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const validateInput = (name, value) => {
        let isValid = false;
        switch (name) {
            case "FirstName":
            case "LastName":
                isValid = value.trim() !== "";
                break;
            case "Email":
                isValid = isValidEmail(value);
                break;
            case "Password":
                isValid = isValidPassword(value);
                break;
            case "PasswordConfirm":
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

        if (!formData.FirstName) errors.FirstName = "First name is required";
        if (!formData.LastName) errors.LastName = "Last name is required";
        if (!isValidEmail(formData.Email)) errors.Email = "Email is not valid";
        if (!isValidPassword(formData.Password)) errors.Password = "Password must be at least 8 characters, include one number, one uppercase letter, and one lowercase letter";
        if (formData.Password !== formData.PasswordConfirm) errors.PasswordConfirm = "Passwords do not match";

        setFormErrors(errors);

        if (Object.keys(errors).length === 0) {
            // COMMENTED OUT UNTIL ROUTE IS CREATED

            try {
                // const response = await fetch('/users', {
                //     method: 'POST',
                //     headers: {
                //         'Content-Type': 'application/json',
                //     },
                //     body: JSON.stringify(formData),
                // });

                // if (response.ok) {
                //     setIsSubmitted(true);
                // } else {
                //     const data = await response.json();
                //     setFormErrors({
                //         submit: data.message || "Error occurred while creating user.",
                //     });
                // }

                console.log("user form data: ", formData);
                setIsSubmitted(true);

            } catch (error) {
                setFormErrors({
                    submit: "Network error. Please try again.",
                });
            }
        }
    };

    return (
        <div className={styles['user-create-page']}>
            <Link to="/" id={styles['back-link']}>← back</Link>
            <h1 id={styles['user-create-title']}>Create Your <br />Account</h1>
            <div className={styles['bottom-form-section']}>
                <div className={styles['user-create-form-container']}>
                    {isSubmitted ? (
                        <div className={styles['success-message']}>User created successfully!</div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <div className={styles['input-group']}>
                                <label>First Name</label>
                                <input
                                    type="text"
                                    name="FirstName"
                                    value={formData.FirstName}
                                    onChange={handleInputChange}
                                />
                                {formErrors.FirstName && <span className={styles.error}>{formErrors.FirstName}</span>}
                            </div>
                            <div className={styles['input-group']}>
                                <label>Last Name</label>
                                <input
                                    type="text"
                                    name="LastName"
                                    value={formData.LastName}
                                    onChange={handleInputChange}
                                />
                                {formErrors.LastName && <span className={styles.error}>{formErrors.LastName}</span>}
                            </div>
                            <div className={styles['input-group']}>
                                <label>Email</label>
                                <div className={styles['input-with-icon']}>
                                    <input
                                        type="email"
                                        name="Email"
                                        value={formData.Email}
                                        onChange={(e) => {
                                            handleInputChange(e);
                                            validateInput(e.target.name, e.target.value);
                                        }}
                                    />
                                    {validFields.Email && <FaCheck className={styles['valid-icon']} />}
                                </div>
                                {formErrors.Email && <span className={styles.error}>{formErrors.Email}</span>}
                            </div>

                            <div className={styles['input-group']}>
                                <label>Password</label>
                                <div className={styles['input-with-icon']}>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="Password"
                                        value={formData.Password}
                                        onChange={(e) => {
                                            handleInputChange(e);
                                            validateInput(e.target.name, e.target.value);
                                        }}
                                    />
                                    {validFields.Password && <FaCheck className={styles['valid-icon']} />}
                                    <span className={styles['toggle-icon']} onClick={togglePasswordVisibility}>
                                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                                    </span>
                                </div>
                                {formErrors.Password && <span className={styles.error}>{formErrors.Password}</span>}
                            </div>
                            <div className={styles['input-group']}>
                                <label>Confirm Password</label>
                                <div className={styles['input-with-icon']}>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="PasswordConfirm"
                                        value={formData.PasswordConfirm}
                                        onChange={(e) => {
                                            handleInputChange(e);
                                            validateInput(e.target.name, e.target.value);
                                        }}
                                    />
                                    {validFields.PasswordConfirm && <FaCheck className={styles['valid-icon']} />}
                                    <span className={styles['toggle-icon']} onClick={togglePasswordVisibility}>
                                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                                    </span>
                                </div>
                                {formErrors.PasswordConfirm && <span className={styles.error}>{formErrors.PasswordConfirm}</span>}
                            </div>

                            <button type="submit">Create User</button>
                            {formErrors.submit && <span className={styles.error}>{formErrors.submit}</span>}
                        </form>
                    )}
                </div>
                <div id={styles['redirect-to-sign-in']}>
                    <em>Already have an acccount?</em>
                    <Link to="/login-user"> Sign in → </Link>
                </div>
            </div>
        </div>
    );

};

export default Web2UserCreate;
