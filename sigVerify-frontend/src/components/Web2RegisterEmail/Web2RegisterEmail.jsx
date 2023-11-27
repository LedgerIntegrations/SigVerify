import styles from './Web2RegisterEmail.module.css';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import logoImage from '../../assets/svLogo.png';
import LoadingIcon from '../LoadingIcon/LoadingIcon';
import axios from 'axios';

function RegisterEmail() {
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

    await axios.post('http://localhost:3001/api/user/register', { email })
    .then(response => 
    {
      const { ok, message } = response.data;

      if (!ok) 
      {
        throw new Error(message || 'Failed to register.');
      }

      setCurrentMessage(message);

      console.log('Email submitted:', email);
    })
    .catch(err => {
      setError(err.message);
    }).finally(() => {
      setIsLoading(false);
    });
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
        <button 
          className={isLoading ? "loading" : ""}
          disabled={isLoading} onClick={handleSubmit}>
            {isLoading ? (
            <LoadingIcon />
            ) : '' }
            Register
        </button>
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
