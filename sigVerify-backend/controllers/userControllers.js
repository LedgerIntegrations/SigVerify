// /sigVerify-backend/controllers/userControllers
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { sendAuthTokenEmail } from './helpers/index.js';
import dotenv from 'dotenv';
import UserModel from '../models/User.js';
import { generateJwtAndSetAsAuthTokenCookie } from './utils/authUtils.js';
import { profile } from 'console';

dotenv.config();

//hard coded routes
const loginApiRoute = 'http://localhost:3001/api/user/login';
const loginClientRoute = 'http://localhost:5173/login-user';

const SIGNUP_TOKEN_LENGTH = 32;
const HTTP_OK = 200;
const HTTP_INTERNAL_SERVER_ERROR = 500;

// * UTILITY FUNCTIONS
// * ------------------------------------------------
// Ensuring consistency in hashing
async function hashEmail(email) {
    return crypto.createHash('sha256').update(email).digest('hex');
}

async function hashPassword(password) {
    return bcrypt.hash(password, 10);
}

// * ------------------------------------------------

// * check if email already exists, if not create registration initialization tables
const registerUser = async (req, res) => {
    const { email } = req.body;
    const hashedEmail = await hashEmail(email);
    try {
        const authToken = await UserModel.getAuthTokenByHashedEmail(hashedEmail);

        // user exists, but the email has not been authenticated yet
        if (typeof authToken === 'string') {
            // * send new email with link to authenticate and exit function
            await sendAuthTokenEmail(email, authToken);

            return res.status(HTTP_OK).json({
                userAuthenticated: false,
                emailSent: true,
                message: `Email was already registered but still needs to be verified. Re-sending authentication email to: ${email}.`,
            });
        }
        // email has already been authenticated
        if (authToken === null) {
            // * send response user already authenticated and exists, exit
            return res.status(HTTP_OK).json({
                userAuthenticated: true, // Assuming this should be true if authenticated
                emailSent: false,
                message: 'This email is already registered and authenticated, proceed to login.',
            });
        }
        // user email doesn't exist in database
        if (authToken === 1) {
            // initial user created without profile info, used for email auth initially
            const newAuthToken = await UserModel.initializeUserRegistration(email);
            await sendAuthTokenEmail(email, newAuthToken);

            return res.status(HTTP_OK).json({
                userAuthenticated: false,
                emailSent: true,
                message: `Email registered! Authentication e-mail sent to: ${email}.`,
            });
        }
    } catch (err) {
        console.error('Error processing request', err);
        return res.status(HTTP_INTERNAL_SERVER_ERROR).json({ error: 'Internal server error' });
    }
};

// * finalizing registation by authenticating email authToken, and inserting users profile data
const completeUserRegistration = async (req, res) => {
    const { firstName, lastName, password, token, publicKey } = req.body;

    if (!firstName || !lastName || !token || !password || !publicKey) {
        return res.status(400).json({
            error: 'Missing fields from profile creation form.',
        });
    }

    try {
        // check if matching authToken exists in database
        const userCredentialsId = await UserModel.verifyUserToken(token);
        if (userCredentialsId === null) {
            return res.status(404).json({ error: 'User with the provided email not found or already created.' });
        }

        const hashedPassword = await hashPassword(password);
        await UserModel.updateCredentials(userCredentialsId, { hashedPassword, publicKey });
        await UserModel.finalizeUserRegistration(token, firstName, lastName);

        //get profile id from credentials id
        const userProfileId = await UserModel.getUserProfileIdByCredentialsId(userCredentialsId);
        const userProfileData = await UserModel.getUserProfileDataById(userProfileId);

        // Use the utility function to generate and set the http only authToken cookie
        await generateJwtAndSetAsAuthTokenCookie(res, userProfileId);

        res.status(200).json({
            message: 'New user created successfully.',
            user: userProfileData,
        });
    } catch (err) {
        console.error('Error processing request', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

// used when a user revisits application with a cookie still in browser to bypass login page ✅
const authenticateExistingCookie = async (req, res) => {
    const profileId = req.user.profileId;

    try {
        const profileData = UserModel.getUserProfileDataById(profileId);

        res.status(200).json({
            message: 'Existing user cookie authenticated.',
            user: profileData,
        });
    } catch (err) {
        console.error('Error processing request', err);
        return res.status(500).json({ error: 'Internal server error inside authenticateExistingCookie' });
    }
};

const removeAuthTokenCookie = async (req, res) => {
    try {
        res.clearCookie('authToken', { path: '/' });
        res.status(200).json({
            message: 'HttpOnly authToken cookie successfully deleted from server.',
        });
    } catch (err) {
        console.log(err);
    }
};

const authenticateLogin = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            error: 'Please provide both email and password.',
            loggedIn: false,
        });
    }

    try {
        const hashedEmail = await hashEmail(email);

        const userCredentials = UserModel.getAuthTokenByHashedEmail(hashedEmail);

        // first check if user email exists
        if (userCredentials === 1) {
            return res.status(401).json({ error: 'Email does not exist.', loggedIn: false });
        }

        // then check if email is not authenticated
        if (userCredentials.auth_token !== null) {
            return res.status(401).json({
                error: 'Email is not verified. Please verify your email first.',
                loggedIn: false,
            });
        }

        const isPasswordCorrect = await bcrypt.compare(password, userCredentials.hashed_password);

        if (!isPasswordCorrect) {
            // TODO: update credentials table failed attemps +1
            // TODO: check if credentials table failed_attempts > 5
            return res.status(401).json({ error: 'Invalid password.', loggedIn: false });
        }

        // Continues if password is correct, and email is authenticated

        //get profile id from credentials id
        const userProfileId = await UserModel.getUserProfileIdByCredentialsId(userCredentials.id);
        const userProfileData = await UserModel.getUserProfileDataById(userProfileId);

        // Use the utility function to generate and set the http only authToken cookie
        await generateJwtAndSetAsAuthTokenCookie(res, userProfileId);

        res.status(200).json({
            message: 'Login successful',
            user: userProfileData,
        });
    } catch (err) {
        console.error('Error processing request', err);
        return res.status(500).json({ error: 'Internal server error inside user authenticateLogin' });
    }
};

const updateXrplWalletAddress = async (req, res) => {
    const profileId = req.user.profileId;
    const { newWalletAddress } = req.body;

    if (!userId || !newWalletAddress) {
        return res.status(400).json({
            error: 'Please provide both user ID and new XRPL wallet address.',
        });
    }

    try {
        const successfulUpdateBool = await UserModel.updateUserXrplWalletAddress(newWalletAddress, profileId);

        if (successfulUpdateBool) {
            return res.status(HTTP_OK).json({
                message: 'XRPL wallet address updated successfully.',
            });
        } else {
            return res.status(HTTP_INTERNAL_SERVER_ERROR).json({ message: 'Failed to update xrpl wallet.' });
        }
    } catch (err) {
        console.error('Error processing request', err);
        return res.status(HTTP_INTERNAL_SERVER_ERROR).json({ error: 'Internal server error' });
    }
};

const getUserProfileData = async (req, res) => {
    const profileId = req.user.profileId;
    try {
        const profileData = await UserModel.getUserProfileData(profileId);

        res.status(200).json({
            data: profileData,
        });
    } catch (err) {
        console.error('Error processing request', err);
        return res.status(500).json({ error: 'Internal server error inside getUserProfileData controller.' });
    }
};

const getUserPublicKeyAndXrplWalletByHashedEmail = async (req, res) => {
    const requestedEmailHash = req.body.email;
    console.log('requestedEmailHash: ', requestedEmailHash);

    const client = await pool.connect();
    try {
        const getPublicKeyQuery = `
            SELECT
                uc.public_key,
                up.verified_xrpl_wallet_address
            FROM
                user_credentials uc
            JOIN
                user_profiles up ON uc.id = up.user_credentials_id
            WHERE
                uc.hashed_email = $1;
        `;

        const userPublicKeyResult = await client.query(getPublicKeyQuery, [requestedEmailHash]);

        if (userPublicKeyResult.rows.length === 0) {
            return res.status(401).json({ error: 'this email is not found in our database.' });
        }

        const user = userPublicKeyResult.rows[0];

        // if (user.verified_xrpl_wallet_address === null) {
        //     return res.status(401).json({ error: 'User has not authenticated a xrpl wallet yet.' });
        // }

        res.status(200).json({
            message: 'found user publickey and verified wallet.',
            data: {
                publicKey: user.public_key,
                verifiedWallet: user.verified_xrpl_wallet_address,
            },
        });
    } catch (err) {
        console.error('Error processing request in getting profile page data', err);
        return res
            .status(HTTP_INTERNAL_SERVER_ERROR)
            .json({ error: 'Internal server error querying profile page data' });
    } finally {
        client.release();
    }
};

export {
    registerUser,
    completeUserRegistration,
    authenticateExistingCookie,
    removeAuthTokenCookie,
    authenticateLogin,
    updateXrplWalletAddress,
    getUserPublicKeyAndXrplWalletByHashedEmail,
};
