import React, { useContext } from 'react';
import styles from './MyNfts.module.css';
import Tile from '../Tile/Tile';
import { AccountContext } from '../../App';

function MyNfts() {
    const [accountObject, setAccountObject] = useContext(AccountContext);

    return (
      <div className={styles.nfts}>
        <div className={styles.nftsInnerDiv}>
          <h1 className='pageTitle'>Nfts</h1>
          <p>All things to do with them NFT's.</p>
          <div className={styles.tiles}>
            <Tile title="My Wallet" icon="🪪" link="/nfts" finePrint='' />
            <Tile title="NFTs" icon="⚖️" link="/nfts" finePrint='' />
            <Tile title="Smart Contracts" icon="📝" link="/nfts" finePrint='' />
            <Tile title="Conditionals" icon="💡" link="/nfts" finePrint='' />
            {/* Add more tiles as needed */}
          </div>
        </div>
      </div>
    )
  };

export default MyNfts;