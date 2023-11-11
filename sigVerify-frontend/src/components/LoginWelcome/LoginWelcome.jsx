import React, { useContext } from 'react';
import styles from './LoginWelcome.module.css';
import { AccountContext } from '../../App';

// currently taken out of application temporarily

function LoginWelcome() {
    const [accountObject, setAccountObject] = useContext(AccountContext);

    return (
        <div className={styles.loginWelcomeContainer}>
            <section id={styles.introSection}>
                <p id={styles.tier}>Free Tier</p>
                <h3 id={styles.welcomeHeader}>Hello {accountObject?.firstName},</h3>
                <p id={styles.welcomeMessage}>welcome back.</p>
            </section>


        </div >
    )
}

export default LoginWelcome