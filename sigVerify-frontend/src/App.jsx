import React from 'react';
import './App.css';
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
    padding-top: 14vh;
    width: 100vw;
    min-height: 75vh;
    max-height: fit-content;
    display: flex;
    flex-flow: column;
    justify-content: start;
`;

//web2 user profile handler pages (shown to logged out users)
import LandingPage from './components/pages/loggedOut/LandingPage';
import EmailRegistrationPage from './components/pages/loggedOut/EmailRegistrationPage';
import CreateAccountPage from './components/pages/loggedOut/CreateAccountPage';
import LoginPage from './components/pages/loggedOut/LoginPage';

// navigation added to all logged in pages
import NavigationComponent from './components/Navigation/NavigationComponent';

// pages (shown to logged in users, wrapped with Navigation component)
import Dashboard from './components/pages/loggedIn/DashboardPage';
import DocumentsPage from './components/pages/loggedIn/DocumentsPage/DocumentsPage';
import XrplUiPage from './components/pages/loggedIn/XrplUiPage/XrplUiPage';
import Profile from './components/pages/loggedIn/ProfilePage/ProfilePage';
import Settings from './components/pages/loggedIn/Settings/Settings';
import UploadDocumentComponent from './components/pages/loggedIn/DocumentsPage/UploadDocumentComponent';
import DocumentPreparation from './components/pages/loggedIn/DocumentsPage/DocumentPreperation';

// GLOBAL ACCOUNT INFORMATION
export const AccountContext = createContext();

// helper function to wrap a page component with navigation component
const withNavigation = (Component) => {
    return function WrappedComponent(props) {
        return (
            <>
                <NavigationComponent />
                <PageWrapper>
                    <Component {...props} />
                </PageWrapper>
            </>
        );
    };
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
            console.log('App component useEffect logging because account is logged in.');
        }
    }, [accountObject]);

    return (
        <Router>
            <AccountContext.Provider value={[accountObject, setAccountObject]}>
                <AppWrapper>
                    <Routes>
                        {/* LOGGED OUT ROUTES */}
                        <Route
                            path="/"
                            element={accountObject.loggedIn ? <Navigate to="/dashboard" replace /> : <LandingPage />}
                        />
                        <Route
                            path="/login-user"
                            element={
                                accountObject.loggedIn ? (
                                    <Navigate to="/dashboard" replace />
                                ) : (
                                    React.createElement(LoginPage)
                                )
                            }
                        />
                        <Route
                            path="/register-user"
                            element={
                                accountObject.loggedIn ? (
                                    <Navigate to="/dashboard" replace />
                                ) : (
                                    React.createElement(EmailRegistrationPage)
                                )
                            }
                        />
                        <Route
                            path="/create-user"
                            element={
                                accountObject.loggedIn ? (
                                    <Navigate to="/dashboard" replace />
                                ) : (
                                    React.createElement(CreateAccountPage)
                                )
                            }
                        />

                        {/* LOGGED IN ROUTES */}
                        <Route
                            path="/dashboard"
                            element={
                                accountObject.loggedIn ? (
                                    React.createElement(withNavigation(Dashboard))
                                ) : (
                                    <Navigate to="/" replace />
                                )
                            }
                        />
                        <Route
                            path="/profile"
                            element={
                                accountObject.loggedIn ? (
                                    React.createElement(withNavigation(Profile))
                                ) : (
                                    <Navigate to="/" replace />
                                )
                            }
                        />
                        <Route
                            path="/settings"
                            element={
                                accountObject.loggedIn ? (
                                    React.createElement(withNavigation(Settings))
                                ) : (
                                    <Navigate to="/" replace />
                                )
                            }
                        />
                        <Route
                            path="/documents"
                            element={
                                accountObject.loggedIn ? (
                                    React.createElement(withNavigation(DocumentsPage))
                                ) : (
                                    <Navigate to="/" replace />
                                )
                            }
                        />
                        <Route
                            path="/upload"
                            element={
                                accountObject.loggedIn ? (
                                    React.createElement(withNavigation(UploadDocumentComponent))
                                ) : (
                                    <Navigate to="/" replace />
                                )
                            }
                        />
                        <Route
                            path="/xrpl-ui"
                            element={
                                accountObject.loggedIn ? (
                                    React.createElement(withNavigation(XrplUiPage))
                                ) : (
                                    <Navigate to="/" replace />
                                )
                            }
                        />
                        <Route
                            path="/prepare"
                            element={
                                accountObject.loggedIn ? (
                                    React.createElement(withNavigation(DocumentPreparation))
                                ) : (
                                    <Navigate to="/" replace />
                                )
                            }
                        />
                    </Routes>
                </AppWrapper>
            </AccountContext.Provider>
        </Router>
    );
}

export default App;
