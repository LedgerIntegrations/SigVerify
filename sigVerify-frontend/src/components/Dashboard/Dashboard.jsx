import React, { useContext } from 'react';
import './Dashboard.css';
import Tile from '../Tile/Tile';
import { AccountContext } from '../../App';

function Dashboard() {
    const [accountObject, setAccountObject] = useContext(AccountContext);

  return (
    <div className="dashboard">
      <h1>Welcome, <em>{accountObject.wallet}</em></h1>
      <div className="tiles">
        <Tile title="Upload Document" icon="📂" link="/upload" />
        <Tile title="Sign Document" icon="🖋️" link="/sign" />
        {/* Add more tiles as needed */}
      </div>
    </div>
  )
};

export default Dashboard;