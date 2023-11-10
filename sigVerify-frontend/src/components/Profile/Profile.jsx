import React, { useContext } from 'react';
import styles from './Profile.module.css';
import Tile from '../Tile/Tile';
import { AccountContext } from '../../App';

function Profile() {
    const [accountObject, setAccountObject] = useContext(AccountContext);

    return (
      <div className={styles.dashboard}>
        <div className={styles.dashboardInnerDiv}>
  
          <h1>Profile</h1>
          <p>This section contains all your profile information.</p>
    
          <div className={styles.tiles}>
            <Tile title="X" icon="💡" link="/profile" finePrint='' />
            <Tile title="X" icon="💡" link="/profile" finePrint='' />
            <Tile title="X" icon="💡" link="/profile" finePrint='' />
            <Tile title="X" icon="💡" link="/profile" finePrint='' />
            {/* Add more tiles as needed */}
          </div>
        </div>
      </div>
    )
  };

export default Profile;