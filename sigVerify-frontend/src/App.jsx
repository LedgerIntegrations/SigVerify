import { createContext, useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Navigate } from 'react-router-dom';

import Navigation from './components/Navigation/Navigation';
import HomePage from './components/HomePage/HomePage';
import Login from './components/Login/Login';
import UploadDocument from './components/UploadDocument/UploadDocument';
import VerifySignature from './components/VerifySignature/VerifySignature';
import AccountSigsPage from './components/AccountSigsPage/AccountSigsPage';
export const AccountContext = createContext();

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
        <Navigation />
        <Routes>
          <Route path="/" element={accountObject.loggedIn ? <Navigate to="/sign" replace /> : <HomePage />} />
          <Route path="/login" element={accountObject.loggedIn ? <Navigate to="/sign" replace /> : <Login />} />
          <Route path="/mysigs" element={accountObject.loggedIn ? <AccountSigsPage /> : <Navigate to="/" replace />} />
          <Route path="/verify" element={accountObject.loggedIn ? <VerifySignature /> : <Navigate to="/" replace />} />
          <Route path="/sign" element={accountObject.loggedIn ? <UploadDocument /> : <Navigate to="/" replace />} />
        </Routes>
      </div>
    </AccountContext.Provider>
  </Router>
  );
}

export default App;


