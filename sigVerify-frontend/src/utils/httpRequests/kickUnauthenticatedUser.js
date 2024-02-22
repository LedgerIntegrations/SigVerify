import { removeUserAuthTokenCookie } from './routes/users';

const kickUnauthenticatedUser = async (setAccountObject) => {
    try {
        setAccountObject({ loggedIn: false });
        window.sessionStorage.clear();
        const removeCookieResponse = await removeUserAuthTokenCookie();
        console.log(removeCookieResponse);
    } catch (error) {
        console.error('Error in kickUnauthenticatedUser:', error);
    }
};

export default kickUnauthenticatedUser;