import React, { useContext } from 'react';
import './Dashboard.css';
import Tile from '../Tile/Tile';
import { AccountContext } from '../../App';

function Dashboard() {
  const [accountObject, setAccountObject] = useContext(AccountContext);

  return (
    <div className="dashboard">
      <div id='dashboard-inner-div'>

        <h1>Welcome, <em>{accountObject.wallet.slice(0, 8)}...</em></h1>
        <div id='dashboard-stats'>
          <div>
            <span>2</span>
            <p>Actions</p>
          </div>
          <div>
            <span>1</span>
            <p>Waiting</p>
          </div>
          <div>
            <span>5</span>
            <p>Expiring</p>
          </div>
          <div>
            <span>12</span>
            <p>Complete</p>
          </div>
        </div>
        <div className="tiles">
          <Tile title="My Documents" icon="📂" link="/upload" />
          <Tile title="My NFTs" icon="🪪" link="/sign" />
          <Tile title="Inbox" icon="📬" link="/upload" />
          <Tile title="User Settings" icon="⚙️" link="/sign" />
          {/* Add more tiles as needed */}
        </div>
      </div>
    </div>
  )
};

export default Dashboard;