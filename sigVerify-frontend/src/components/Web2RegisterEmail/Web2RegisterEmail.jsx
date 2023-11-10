import styles from './Web2RegisterEmail.module.css';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import logoImage from '../Navigation/assets/svLogo.png';

function RegisterEmail() {
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

    try {
      const response = await fetch('http://localhost:3001/api/user/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to register.');
      }

      setCurrentMessage(data.message);

    } catch (err) {
      setError(err.message);
    };

    // Make your API call or other actions here
    console.log('Email submitted:', email);

  };

  return (
    <div className={styles['user-register-page']}>
      <Link to="/" id={styles['back-link']}>← back</Link>
      <h1 id={styles['user-register-title']}>Register Your <br />E-mail</h1>
      <img id={styles["logo-image"]} src={logoImage} />

      <div className={styles['register-email-container']}>
        <h2>Register Email</h2>
        <input
          id={styles['register-email-input']}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
        />
        <button onClick={handleSubmit}>Register</button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {currentMessage && <p style={{ color: 'green', maxWidth: '310px', fontSize: '.9em', textAlign: 'start' }}>{currentMessage}</p>}
        <div id={styles['redirect-to-sign-in']}>
          <em>Already have an acccount?</em>
          <Link to="/login-user"> Sign in → </Link>
        </div>
      </div>

    </div>
  );
}

export default RegisterEmail;
