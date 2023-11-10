import React from 'react';

import { createContext, useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Navigate } from 'react-router-dom';

import Navigation from './components/Navigation/Navigation';
import HomePage from './components/HomePage/HomePage';

// import Login from './components/xummLogin/xummLogin';

import RegisterEmail from './components/Web2RegisterEmail/Web2RegisterEmail';
import Web2UserCreate from './components/Web2UserCreate/Web2UserCreate';
import Web2UserLogin from './components/Web2UserLogin/Web2UserLogin';

import Dashboard from './components/Dashboard/Dashboard';
import MyDocuments from './components/MyDocuments/MyDocuments';
import MyNfts from './components/MyNfts/MyNfts';
import Profile from './components/Profile/Profile';
import Settings from './components/Settings/Settings';

// import UploadDocument from './components/UploadDocument/UploadDocument';
// import VerifySignature from './components/VerifySignature/VerifySignature';
// import AccountSigsPage from './components/AccountSigsPage/AccountSigsPage';

import FileUpload from './components/FileUpload/FileUpload';

import './App.css'

export const AccountContext = createContext();

const withNavigation = (Component) => {
  return function WrappedComponent(props) {
    return (
      <>
        <Navigation />
        <Component {...props} />
        
      </>
    );
  }
};

function useSessionStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.sessionStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      window.sessionStorage.setItem(key, JSON.stringify(value));
      setStoredValue(value);
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
};

function App() {

  const [accountObject, setAccountObject] = useSessionStorage('accountObject', { loggedIn: false });

  useEffect(() => {
    if (accountObject.loggedIn) {
      console.log("App component useEffect logging because account is logged in.")
    }
  }, [accountObject]);

  return (
    <Router>
      <AccountContext.Provider value={[accountObject, setAccountObject]}>
        <div id='appContainer'>
          <Routes>  
            <Route path="/" element={accountObject.loggedIn ? <Navigate to="/dashboard" replace /> : <HomePage />} />
            <Route path="/login-user" element={accountObject.loggedIn ? <Navigate to="/dashboard" replace /> : React.createElement(Web2UserLogin)} />
            <Route path="/register-user" element={accountObject.loggedIn ? <Navigate to="/dashboard" replace /> : React.createElement(RegisterEmail)} />
            <Route path="/create-user" element={accountObject.loggedIn ? <Navigate to="/dashboard" replace /> : React.createElement(Web2UserCreate)} />
            {/* <Route path="/mysigs" element={accountObject.loggedIn ? React.createElement(withNavigation(AccountSigsPage)) : <Navigate to="/" replace />} /> */}
            {/* <Route path="/verify" element={accountObject.loggedIn ? React.createElement(withNavigation(VerifySignature)) : <Navigate to="/" replace />} /> */}
            {/* <Route path="/sign" element={accountObject.loggedIn ? React.createElement(withNavigation(UploadDocument)) : <Navigate to="/" replace />} /> */}
            {/* <Route path="/fileUpload" element={accountObject.loggedIn ? React.createElement(withNavigation(FileUpload)) : <Navigate to="/" replace />} /> */}
            <Route path="/dashboard" element={accountObject.loggedIn ? React.createElement(withNavigation(Dashboard)) : <Navigate to="/" replace />} />
            <Route path="/profile" element={accountObject.loggedIn ? React.createElement(withNavigation(Profile)) : <Navigate to="/" replace />} />
            <Route path="/settings" element={accountObject.loggedIn ? React.createElement(withNavigation(Settings)) : <Navigate to="/" replace />} />
            <Route path="/documents" element={accountObject.loggedIn ? React.createElement(withNavigation(MyDocuments)) : <Navigate to="/" replace />} />
            <Route path="/nfts" element={accountObject.loggedIn ? React.createElement(withNavigation(MyNfts)) : <Navigate to="/" replace />} />
          </Routes>
        </div>
      </AccountContext.Provider>
    </Router>
  );
}

export default App;


