import styles from './HomePage.module.css'
import React from 'react';
import { Link } from 'react-router-dom';
import logoImage from '../../assets/svLogo.png';
import LandingLoader from '../LandingLoader/LandingLoader';
function HomePage() {
    return (
        <div className={styles.homePageContainer}>
            {/* <LandingLoader /> */}
            <div className={styles.topSection}>
                <h2>Sig Verify</h2>
                <img className={styles.homeImage} src={logoImage} />
                <p className={styles.callToActionText}>Signed, Scanned, <br/> Delivered.</p>
                <p className={styles.callToActionSmaller}>Premier document signing experience.</p>
            </div>
            <div className={styles.bottomSection}>
                <Link to="/login-user" >
                    <button className='buttonPop'>Sign In</button>
                </Link>
                <Link to="/register-user" >
                    <button className='buttonPop'>Create Account</button>
                </Link>
            </div>
        </div>
    );
}

export default HomePage;