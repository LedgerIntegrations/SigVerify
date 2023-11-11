import React, { useContext } from 'react';
import styles from './Dashboard.module.css';
import Tile from '../Tile/Tile';
import { AccountContext } from '../../App';
import LoginWelcome from '../LoginWelcome/LoginWelcome';

const documentIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
  </svg>
);

const signatureIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M7.864 4.243A7.5 7.5 0 0119.5 10.5c0 2.92-.556 5.709-1.568 8.268M5.742 6.364A7.465 7.465 0 004.5 10.5a7.464 7.464 0 01-1.15 3.993m1.989 3.559A11.209 11.209 0 008.25 10.5a3.75 3.75 0 117.5 0c0 .527-.021 1.049-.064 1.565M12 10.5a14.94 14.94 0 01-3.6 9.75m6.633-4.596a18.666 18.666 0 01-2.485 5.33" />
  </svg>
);

const profileIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>

);

const settingsIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12a7.5 7.5 0 0015 0m-15 0a7.5 7.5 0 1115 0m-15 0H3m16.5 0H21m-1.5 0H12m-8.457 3.077l1.41-.513m14.095-5.13l1.41-.513M5.106 17.785l1.15-.964m11.49-9.642l1.149-.964M7.501 19.795l.75-1.3m7.5-12.99l.75-1.3m-6.063 16.658l.26-1.477m2.605-14.772l.26-1.477m0 17.726l-.26-1.477M10.698 4.614l-.26-1.477M16.5 19.794l-.75-1.299M7.5 4.205L12 12m6.894 5.785l-1.149-.964M6.256 7.178l-1.15-.964m15.352 8.864l-1.41-.513M4.954 9.435l-1.41-.514M12.002 12l-3.75 6.495" />
  </svg>
);

const walletIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
  </svg>
);


function Dashboard() {
  const [accountObject, setAccountObject] = useContext(AccountContext);

  return (
    <div className="pageContainer" >
      <div className={styles.outterDashboardContainer}>
        <section>
          <div className="cardContainer">
            <LoginWelcome />
            <div className={styles.dashboardInnerDiv}>

              {/* <h1>Welcome, <br /><em>{accountObject.email}...</em></h1> */}
              <div className={styles.welcomeStats}>
                <div>
                  <span>5</span>
                  <p>Actions</p>
                </div>
                <div>
                  <span>5</span>
                  <p>Waiting</p>
                </div>
                <div>
                  <span>0</span>
                  <p>Expiring</p>
                </div>
              </div>
            </div>

          </div>
          <div className={styles.tiles}>
            <Tile title="Profile" icon={profileIcon} link="/profile" finePrint="" />
            <Tile title="Settings" icon={settingsIcon} link="/settings" finePrint="" />
            <Tile title="Docs" icon={documentIcon} link="/documents" finePrint="" />
            <Tile title="Xrpl" icon={signatureIcon} link="/xrpl-ui" finePrint="" />
            {/* Add more tiles as needed */}
          </div>

        </section>
        <section>
          <div id={styles.dashboardDocumentSection}>
            <h3>Documents</h3>
            <div className={styles.longTiles}>
              <div className={styles.totalStat}>
                <h4>Total Documents:</h4>
                <em>6</em>
              </div>
              <div className={styles.stat}>
                <h4>Recieved:</h4>
                <em>4</em>
              </div>
              <div className={styles.stat}>
                <h4>Sent:</h4>
                <em>4</em>
              </div>
              <div className={styles.stat}>
                <h4>Expired:</h4>
                <em>0</em>
              </div>
            </div>
          </div>
          <div id={styles.dashboardDocumentSection}>
            <h3>NFTs</h3>
            <div className={styles.longTiles}>
              <div className={styles.totalStat}>
                <h4>Total Signatures:</h4>
                <em>2</em>
              </div>
              <div className={styles.stat}>
                <h4>Recieved:</h4>
                <em>1</em>
              </div>
              <div className={styles.stat}>
                <h4>Sent:</h4>
                <em>1</em>
              </div>
              <div className={styles.stat}>
                <h4>Deleted:</h4>
                <em>0</em>
              </div>
            </div>
          </div>
          <div id={styles.bottomBumper}></div>
        </section>




      </div>
    </div>
  )
};

export default Dashboard;
