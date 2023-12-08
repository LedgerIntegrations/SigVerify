import React from 'react';
import './App.css'
import styled from 'styled-components';

import { createContext, useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Navigate } from 'react-router-dom';

// styled components
const AppWrapper = styled.div`
  width: 100vw;
  min-height: 100vh;
  max-height: fit-content;
  background-color: rgb(236, 235, 235);
`;

const PageWrapper = styled.div`
  background-color: rgb(236, 235, 235);
  padding: 20px;
  padding-top: 12vh;
  width: 100vw;
  min-height: 75vh;
  max-height: fit-content;
  display: flex;
  flex-flow: column;
  justify-content: start;
`

//web2 user profile handler pages (shown to logged out users)
import HomePage from './components/HomePage/HomePage';
import RegisterEmail from './components/Web2RegisterEmail/Web2RegisterEmail';
import Web2UserCreate from './components/Web2UserCreate/Web2UserCreate';
import Web2UserLogin from './components/Web2UserLogin/Web2UserLogin';

// navigation added to all logged in pages
// import Navigation from './components/Navigation/Navigation';
import NavigationComponent from './components/Navigation/NavigationComponent';
// import SecondNavigationComponent from './components/Navigation/SecondNavigationComponent';
import Footer from './components/Footer/Footer';

// pages (shown to logged in users, wrapped with Navigation component)
import Dashboard from './components/Dashboard/Dashboard';
import DocumentsPage from './components/DocumentsPage/DocumentsPage';
import XrplUiPage from './components/XrplUiPage/XrplUiPage';
import Profile from './components/Profile/Profile';
import Settings from './components/Settings/Settings';
import UploadDocumentComponent from './components/DocumentsPage/UploadDocumentComponent/UploadDocumentComponent';

// ====SIDELINED XRPL/XUMM INTEGRATED COMPONENTS====
// import Login from './components/xummLogin/xummLogin';
// import UploadDocument from './components/UploadDocument/UploadDocument';
// import VerifySignature from './components/VerifySignature/VerifySignature';
// import AccountSigsPage from './components/AccountSigsPage/AccountSigsPage';

// GLOBAL ACCOUNT INFORMATION
export const AccountContext = createContext();



// helper function to wrap a page component with navigation component
const withNavigation = (Component) => {
  return function WrappedComponent(props) {
    return (
      <>
        {/* <SecondNavigationComponent /> */}
        <NavigationComponent />
        <PageWrapper>
          <Component {...props} />
        </PageWrapper>
        {/* <Footer /> */}
      </>
    );
  }
};

// Custom hook for managing state that is synchronized with sessionStorage. Helps to persist state across browser sessions and page reloads
function useSessionStorage(key, initialValue) {
  // useState initialized with a function that tries to load the value from sessionStorage. If key does not exist, uses initalValue given { loggedIn: false }.
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.sessionStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });
  // used to update the state and synchronize with sessionStorage.
  const setValue = (value) => {
    try {
      window.sessionStorage.setItem(key, JSON.stringify(value));
      setStoredValue(value);
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
}

function App() {
  // used to store the user's account information, initialized and managed using the useSessionStorage custom hook.
  // const [accountObject, setAccountObject] = useSessionStorage('accountObject', { loggedIn: false });
  const [accountObject, setAccountObject] = useSessionStorage('accountObject', { loggedIn: false });

  useEffect(() => {
    if (accountObject.loggedIn) {
      console.log("App component useEffect logging because account is logged in.")
    }
  }, [accountObject]);

  return (
    <Router>
      <AccountContext.Provider value={[accountObject, setAccountObject]}>
        <AppWrapper>
          <Routes>
            {/* LOGGED OUT ROUTES */}
            <Route path="/" element={accountObject.loggedIn ? <Navigate to="/dashboard" replace /> : <HomePage />} />
            <Route path="/login-user" element={accountObject.loggedIn ? <Navigate to="/dashboard" replace /> : React.createElement(Web2UserLogin)} />
            <Route path="/register-user" element={accountObject.loggedIn ? <Navigate to="/dashboard" replace /> : React.createElement(RegisterEmail)} />
            <Route path="/create-user" element={accountObject.loggedIn ? <Navigate to="/dashboard" replace /> : React.createElement(Web2UserCreate)} />

            {/* ==== SIDELINED XRPL/XUMM INTEGRATED ROUTES ==== */}
            {/* <Route path="/mysigs" element={accountObject.loggedIn ? React.createElement(withNavigation(AccountSigsPage)) : <Navigate to="/" replace />} /> */}
            {/* <Route path="/verify" element={accountObject.loggedIn ? React.createElement(withNavigation(VerifySignature)) : <Navigate to="/" replace />} /> */}
            {/* <Route path="/sign" element={accountObject.loggedIn ? React.createElement(withNavigation(UploadDocument)) : <Navigate to="/" replace />} /> */}
            {/* <Route path="/fileUpload" element={accountObject.loggedIn ? React.createElement(withNavigation(FileUpload)) : <Navigate to="/" replace />} /> */}

            {/* LOGGED IN ROUTES */}
            <Route path="/dashboard" element={accountObject.loggedIn ? React.createElement(withNavigation(Dashboard)) : <Navigate to="/" replace />} />
            <Route path="/profile" element={accountObject.loggedIn ? React.createElement(withNavigation(Profile)) : <Navigate to="/" replace />} />
            <Route path="/settings" element={accountObject.loggedIn ? React.createElement(withNavigation(Settings)) : <Navigate to="/" replace />} />
            <Route path="/documents" element={accountObject.loggedIn ? React.createElement(withNavigation(DocumentsPage)) : <Navigate to="/" replace />} />
            <Route path="/upload" element={accountObject.loggedIn ? React.createElement(withNavigation(UploadDocumentComponent)) : <Navigate to="/" replace />} />
            <Route path="/xrpl-ui" element={accountObject.loggedIn ? React.createElement(withNavigation(XrplUiPage)) : <Navigate to="/" replace />} />
          </Routes>
        </AppWrapper>
      </AccountContext.Provider>
    </Router>
  );
}

export default App;


