import React, { useContext } from 'react';
import styles from './XrplUiPage.module.css';
import Tile from '../Tile/Tile';
import { AccountContext } from '../../App';

function XrplUiPage() {
    const [accountObject, setAccountObject] = useContext(AccountContext);

    return (
      <div className={styles.xrplUi}>
        <div className={styles.xrplUiInnerDiv}>
          <h1 className='pageTitle'>XRPL</h1>
          <p>All things to do with the XRPL.</p>
          <div className={styles.tiles}>
            <Tile title="My Wallet" icon="🪪" link="/xrpl-ui" finePrint='' />
            <Tile title="NFTs" icon="⚖️" link="/xrpl-ui" finePrint='' />
            <Tile title="Smart Contracts" icon="📝" link="/xrpl-ui" finePrint='' />
            <Tile title="Conditionals" icon="💡" link="/xrpl-ui" finePrint='' />
            {/* Add more tiles as needed */}
          </div>
        </div>
      </div>
    )
  };

export default XrplUiPage;