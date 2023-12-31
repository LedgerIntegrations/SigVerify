import { useContext, useState } from 'react';
import styles from './XrplUiPage.module.css';
// import Tile from '../../../helperComponents/Tile/Tile';
import { AccountContext } from '../../../../App';

import RSAKeyPairGenerator from '../../../../utils/rsaKeyHandlers/RSAKeyPairGenerator';
import DocumentEncryptor from '../../../../utils/rsaKeyHandlers/DocumentEncryptor';

function XrplUiPage() {
    // eslint-disable-next-line no-unused-vars
    const [accountObject, setAccountObject] = useContext(AccountContext);
    const [keys, setKeys] = useState({ publicKey: '', privateKey: '' });
    console.log("keys inside top level component: ", keys);

    return (
        <div className={styles.xrplUi}>
            <div className={styles.xrplUiInnerDiv}>
                <h1 className="pageTitle">XRPL</h1>
                <p>All things to do with the XRPL.</p>
                <div>
                    <RSAKeyPairGenerator onKeyPairGenerated={setKeys} />
                    {keys.publicKey && <DocumentEncryptor publicKey={keys.publicKey} />}
                </div>
                {/* <div className={styles.tiles}>
                    <Tile title="My Wallet" icon="🪪" link="/xrpl-ui" finePrint="" />
                    <Tile title="NFTs" icon="⚖️" link="/xrpl-ui" finePrint="" />
                    <Tile title="Smart Contracts" icon="📝" link="/xrpl-ui" finePrint="" />
                    <Tile title="Conditionals" icon="💡" link="/xrpl-ui" finePrint="" />
                </div> */}
            </div>
        </div>
    );
}

export default XrplUiPage;
