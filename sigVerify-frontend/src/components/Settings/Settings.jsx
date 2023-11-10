import React, { useContext } from 'react';
import styles from './Settings.module.css';
import Tile from '../Tile/Tile';
import { AccountContext } from '../../App';

function Settings() {
    const [accountObject, setAccountObject] = useContext(AccountContext);

    return (
      <div className={styles.dashboard}>
        <div className={styles.dashboardInnerDiv}>
  
          <h1>Settings</h1>
          <p>This section will be used to configure all your account settings.</p>
    
          <div className={styles.tiles}>
            <Tile title="setting1" icon="💡" link="/settings" finePrint='' />
            <Tile title="setting2" icon="💡" link="/settings" finePrint='' />
            <Tile title="setting3" icon="💡" link="/settings" finePrint='' />
            <Tile title="setting4" icon="💡" link="/settings" finePrint='' />
            {/* Add more tiles as needed */}
          </div>
        </div>
      </div>
    )
  };

export default Settings;