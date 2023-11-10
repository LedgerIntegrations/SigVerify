import React, { useContext } from 'react';
import styles from './MyDocuments.module.css';
import Tile from '../Tile/Tile';
import { AccountContext } from '../../App';

function MyDocuments() {
    const [accountObject, setAccountObject] = useContext(AccountContext);

    return (
      <div className={styles.dashboard}>
        <div className={styles.dashboardInnerDiv}>
  
          <h1>My Documents</h1>
          <p>This section contains all your documents.</p>
          <div className={styles.tiles}>
            <Tile title="View All" icon="📂" link="/my-documents" finePrint='' />
            <Tile title="Legal" icon="⚖️" link="/my-documents" finePrint='' />
            <Tile title="Contractual" icon="📝" link="/my-documents" finePrint='' />
            <Tile title="Conditional" icon="💡" link="/my-documents" finePrint='' />
            {/* Add more tiles as needed */}
          </div>
        </div>
      </div>
    )
  };

export default MyDocuments;