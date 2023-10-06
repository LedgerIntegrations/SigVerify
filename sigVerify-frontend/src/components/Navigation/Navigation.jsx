import './Navigation.css'
import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import logoImg from './assets/svLogo.png';
import UserInfoDropdown from '../UserInfoDropdown/UserInfoDropdown';
import { AccountContext } from '../../App';

function Navigation() {
    const [accountObject, setAccountObject] = useContext(AccountContext);

  return (
    <div id="nav-container">
      <div id="left-side-nav">
        <Link to="/" id="nav-logo">
          <img src={logoImg} alt="Logo" />
        </Link>
        <div id="nav-links">
          {accountObject.loggedIn ? (
            <>
              <Link to="/sign" className='buttonPop'>Sign Doc</Link>
              <Link to="/mysigs" className='buttonPop'>My Sigs</Link>
              <Link to="/verify" className='buttonPop'>Verify Signature</Link>
            </>
          ) : (
            <>
              <Link to="/" className='buttonPop'>Home</Link>
              <Link to="/login" className='buttonPop' id="loginLink">Login</Link>
            </>
          )}
        </div>
      </div>
      <div id="right-side-nav">
        {accountObject.loggedIn && <UserInfoDropdown userInfo={[accountObject, setAccountObject]} />}
      </div>
    </div>
  );
}

export default Navigation;

