import React from 'react';
import './App.css';
import styled from 'styled-components';
import axiosInstance from './utils/httpRequests/axiosInstance';
import { AxiosProvider } from './utils/httpRequests/AxiosContext';
import { createContext, useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import kickUnauthenticatedUser from './utils/httpRequests/kickUnauthenticatedUser';

const AppWrapper = styled.div`
    height: 100%;
    width: 100%;
    background-color: rgb(236, 235, 235);
`;

const PageWrapper = styled.div`
    background-color: rgb(236, 235, 235);
    padding: 20px;
    padding-top: 90px;
    width: 100%;
    height: 100%;
    min-height: 500px;
    display: flex;
    flex-flow: column;
    justify-content: start;
    align-items: center;
    overflow-x: hidden;
`;

//web2 user profile handler pages (shown to logged out users)
import LandingPage from './components/pages/loggedOut/LandingPage';
import EmailRegistrationPage from './components/pages/loggedOut/EmailRegistrationPage';
import CreateAccountPage from './components/pages/loggedOut/CreateAccountPage';
import LoginPage from './components/pages/loggedOut/LoginPage';
import DocumentPage from './components/pages/hybrid/DocumentPage';
// import AllRightsReserved from './components/pages/loggedOut/AllRightsReserved';
import ProfileSearchPage from './components/pages/hybrid/ProfileSearchPage';
// navigation added to all logged in pages
import NavigationComponent from './components/Navigation/NavigationComponent';

// pages (shown to logged in users, wrapped with Navigation component)
import Dashboard from './components/pages/loggedIn/DashboardPage';
import DocumentsPage from './components/pages/loggedIn/DocumentsPage/DocumentsPage';
import SignaturesPage from './components/pages/loggedIn/SignaturesPage/SignaturePage';
import Profile from './components/pages/loggedIn/ProfilePage/ProfilePage';
import Settings from './components/pages/loggedIn/Settings/Settings';
import UploadDocumentComponent from './components/pages/loggedIn/DocumentsPage/UploadDocumentComponent';
import FormsPage from './components/pages/loggedIn/FormsPage/FormsPage';

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
    const [accountObject, setAccountObject] = useSessionStorage('accountObject', { loggedIn: false });

    useEffect(() => {
        // Function to check the authentication cookie
        const checkAuthenticationCookie = async () => {
            try {
                const response = await axiosInstance.post('api/authenticateCookie', {});
                console.log('check authentication cookie response: ', response.status);
                if (response.status === 200) {
                    setAccountObject({ loggedIn: true, ...response.data.user });
                } else {
                    await kickUnauthenticatedUser(setAccountObject);
                }
            } catch (error) {
                console.error('Authentication failed:', error);
                if (error.response.status === 401) {
                    await kickUnauthenticatedUser(setAccountObject);
                }
            }
        };
        // can potentially add a timer to run validate cookie every x
        checkAuthenticationCookie();
    }, []);

    return (
        <Router>
            <AccountContext.Provider value={[accountObject, setAccountObject]}>
                <AxiosProvider>
                    <AppWrapper>
                        <Routes>
                            {/* LOGGED OUT ROUTES */}
                            <Route path="/" element={accountObject.loggedIn ? <Navigate to="/dashboard" replace /> : <LandingPage />} />
                            <Route
                                path="/login-user"
                                element={accountObject.loggedIn ? <Navigate to="/dashboard" replace /> : React.createElement(LoginPage)}
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
                                    accountObject.loggedIn ? <Navigate to="/dashboard" replace /> : React.createElement(CreateAccountPage)
                                }
                            />

                            {/* <Route path="/all-rights-reserved" element={React.createElement(withNavigation(AllRightsReserved))} /> */}

                            <Route
                                path="/document/:documentId"
                                element={
                                    accountObject.loggedIn
                                        ? React.createElement(withNavigation(DocumentPage))
                                        : // <Navigate to="/login-user" replace />
                                          React.createElement(DocumentPage)
                                }
                            />

                            <Route path="/profile/search" element={React.createElement(withNavigation(ProfileSearchPage))} />

                            {/* LOGGED IN ROUTES */}
                            <Route
                                path="/dashboard"
                                element={
                                    accountObject.loggedIn ? React.createElement(withNavigation(Dashboard)) : <Navigate to="/" replace />
                                }
                            />
                            <Route
                                path="/profile"
                                element={
                                    accountObject.loggedIn ? React.createElement(withNavigation(Profile)) : <Navigate to="/" replace />
                                }
                            />
                            <Route
                                path="/signatures"
                                element={
                                    accountObject.loggedIn ? (
                                        React.createElement(withNavigation(SignaturesPage))
                                    ) : (
                                        <Navigate to="/" replace />
                                    )
                                }
                            />
                            <Route
                                path="/settings"
                                element={
                                    accountObject.loggedIn ? React.createElement(withNavigation(Settings)) : <Navigate to="/" replace />
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
                                path="/forms"
                                element={
                                    accountObject.loggedIn ? React.createElement(withNavigation(FormsPage)) : <Navigate to="/" replace />
                                }
                            />
                            {/* <Route
                                path="/prepare"
                                element={
                                    accountObject.loggedIn ? (
                                        React.createElement(withNavigation(DocumentPreparation))
                                    ) : (
                                        <Navigate to="/" replace />
                                    )
                                }
                            /> */}
                        </Routes>
                    </AppWrapper>
                </AxiosProvider>
            </AccountContext.Provider>
        </Router>
    );
}

export default App;
