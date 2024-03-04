// /sigVerify-backend/controllers/userControllers
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { sendAuthTokenEmail } from './helpers/index.js';
import dotenv from 'dotenv';
import * as UserModel from '../models/User.js';
import { generateAndSetAuthToken } from './utils/authUtils.js';

dotenv.config();

//hard coded routes
const loginApiRoute = 'http://localhost:3001/api/user/login';
const loginClientRoute = 'http://localhost:5173/login-user';

const SIGNUP_TOKEN_LENGTH = 32;
const HTTP_OK = 200;
const HTTP_INTERNAL_SERVER_ERROR = 500;

//could hash password on front end before even sending in http request for higher security
async function hashEmail(email) {
    return crypto.createHash('sha256').update(email).digest('hex');
}

async function hashPassword(password) {
    return bcrypt.hash(password, 10);
}

// create tables if email doesnt already exist ✅ step 1
const createInitialUserTablesAndEmailAuthToken = async (req, res) => {
    const { email } = req.body;
    try {
        // * 1 = email already authenticated, 2 = email exists but unauthenticated, 3 = email does not exist
        const userAuthToken = await UserModel.authTokenStatus(email);

        // user exists, but the email has not been authenticated yet
        if (userAuthToken === 2) {
            // * send new email with link to authenticate and exit function
            await sendAuthTokenEmail(email, userAuthToken);

            return res.status(HTTP_OK).json({
                userAuthenticated: false,
                emailSent: true,
                message: `Email was already registered but still needs to be verified. Re-sending authentication email to: ${email}.`,
            });
        }
        // email has already been authenticated
        if (userAuthToken === 1) {
            // * send response user already authenticated and exists, exit
            return res.status(HTTP_OK).json({
                userAuthenticated: true, // Assuming this should be true if authenticated
                emailSent: false,
                message: 'This email is already registered and authenticated, proceed to login.',
            });
        }
        // if null, user email doesn't exist in database
        if (userAuthToken === null) {
            const newAuthToken = crypto.randomBytes(SIGNUP_TOKEN_LENGTH).toString('hex');

            // initial user created without profile info, used for email auth initially
            await UserModel.createNewUser(email, newAuthToken);
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

// verification of auth token and adding new profile data ✅ step 2
const addInitialUserProfileData = async (req, res) => {
    const { FirstName, LastName, Password, PasswordConfirm, Token, PublicKey } = req.body;

    if (!FirstName || !LastName || !Password || !Token || Password !== PasswordConfirm || !PublicKey) {
        return res.status(400).json({
            error: 'Please provide all required fields and ensure passwords match.',
        });
    }

    try {
        const userCredentialsId = await UserModel.verifyUserToken(Token);
        if (userCredentialsId === null) {
            return res.status(404).json({ error: 'User with the provided email not found or already created.' });
        }

        const hashedPassword = await hashPassword(Password);
        await UserModel.updateUserCredentials(userCredentialsId, hashedPassword, PublicKey);
        await UserModel.createUserProfile(userCredentialsId, FirstName, LastName);

        //get profile id from credentials id
        const userProfileId = await UserModel.getUserProfileIdByCredentialsId(userCredentialsId);

        // Use the utility function to generate and set the auth token
        await generateAndSetAuthToken(res, userProfileId);

        res.status(200).json({
            message: 'User creation successful',
            user: {
                firstName: FirstName,
                lastName: LastName,
                membership: 'free', // Default membership type unless specified
                publicKey: PublicKey,
                xrplWallet: null,
                // Add other non-sensitive fields as needed
            },
        });
    } catch (err) {
        console.error('Error processing request', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

// used when a user revisits application with a cookie still in browser to bypass login page ✅
const authenticateExistingCookie = async (req, res) => {
    const profileId = req.user.profileId;
    const client = await pool.connect();

    try {
        const queryForUserDataFromAuthdCookie = `
            SELECT
                uc.public_key,
                uc.hashed_email,
                up.first_name,
                up.last_name,
                up.membership,
                xw.wallet_address
            FROM
                user_profiles AS up
            INNER JOIN
                user_credentials AS uc ON up.user_credentials_id = uc.id
            LEFT JOIN
                xrpl_wallets AS xw ON up.id = xw.user_profile_id
            WHERE
                up.id = $1;
        `;

        const profileData = await client.query(queryForUserDataFromAuthdCookie, [profileId]);

        if (profileData.rows.length === 0) {
            return res.status(401).json({ error: 'User from cookie not found.', loggedIn: false });
        }

        const user = profileData.rows[0];

        res.status(200).json({
            message: 'Login successful',
            user: {
                firstName: user.first_name,
                lastName: user.last_name,
                membership: user.membership,
                publicKey: user.public_key,
                xrplWallet: user.wallet_address,
                // other non-sensitive fields
            },
        });
    } catch (err) {
        console.error('Error processing request', err);
        return res.status(500).json({ error: 'Internal server error inside authenticateExistingCookie' });
    } finally {
        client.release();
    }
};

const removeAuthTokenCookie = async (req, res) => {
    try {
        res.clearCookie('authToken', { path: '/' });
        res.send('Logged out');
    } catch (err) {
        console.log(err);
    }
};

const authenticateLogin = async (req, res) => {
    const { Email, Password } = req.body;

    if (!Email || !Password) {
        return res.status(400).json({
            error: 'Please provide both email and password.',
            loggedIn: false,
        });
    }

    const client = await pool.connect();

    try {
        const hashedEmail = await hashEmail(Email); // Ensuring consistency in hashing
        const loginQuery = `
            SELECT
                uc.id,
                uc.auth_token,
                uc.hashed_password,
                uc.public_key,
                up.id AS profileId,
                up.first_name,
                up.last_name,
                up.membership,
                up.verified_xrpl_wallet_address
            FROM
                user_credentials AS uc
            JOIN
                user_profiles AS up ON up.user_credentials_id = uc.id
            WHERE
                uc.hashed_email = $1;
        `;

        const userLoginResult = await client.query(loginQuery, [hashedEmail]);

        if (userLoginResult.rows.length === 0) {
            return res.status(401).json({ error: 'Email not found.', loggedIn: false });
        }

        const user = userLoginResult.rows[0];

        // email not verified
        if (user.auth_token !== null) {
            return res.status(401).json({
                error: 'Email is not verified. Please verify your email first.',
                loggedIn: false,
            });
        }
        // account creation not completed from email verification link
        if (user.hashed_password === null) {
            return res.status(401).json({
                error: 'Email verified but account not created, follow link from email again.',
                loggedIn: false,
            });
        }

        const isPasswordCorrect = await bcrypt.compare(Password, user.hashed_password);

        if (!isPasswordCorrect) {
            return res.status(401).json({ error: 'Invalid password.', loggedIn: false });
        }

        // Using the utility function to generate and set the auth token
        generateAndSetAuthToken(res, user.profileId);

        res.status(200).json({
            message: 'Login successful',
            user: {
                firstName: user.first_name,
                lastName: user.last_name,
                membership: user.membership,
                publicKey: user.public_key,
                xrplWallet: user.verified_xrpl_wallet_address,
                // other non-sensitive fields can be added here as needed
            },
        });
    } catch (err) {
        console.error('Error processing request', err);
        return res.status(500).json({ error: 'Internal server error inside user authenticateLogin' });
    } finally {
        client.release();
    }
};

const updateDatabaseWithNewVerifiedXrplWalletAddress = async (req, res) => {
    const profileId = req.user.profileId;
    const { newWalletAddress } = req.body;

    if (!userId || !newWalletAddress) {
        return res.status(400).json({
            error: 'Please provide both user ID and new XRPL wallet address.',
        });
    }

    const client = await pool.connect();

    try {
        const updateQuery = `
          UPDATE user_profiles
          SET verified_xrpl_wallet_address = $1
          WHERE id = $2;
        `;

        await client.query(updateQuery, [newWalletAddress, profileId]);

        return res.status(HTTP_OK).json({
            message: 'XRPL wallet address updated successfully.',
        });
    } catch (err) {
        console.error('Error processing request', err);
        return res.status(HTTP_INTERNAL_SERVER_ERROR).json({ error: 'Internal server error' });
    } finally {
        client.release();
    }
};

const getProfilePageData = async (req, res) => {
    const profileId = req.user.profileId;
    console.log('user id inside getProfilePageData endpoint: ', profileId);

    const client = await pool.connect();

    try {
        const profileQuery = `
            SELECT
                COUNT(DISTINCT docs.id) AS total_documents,
                COUNT(DISTINCT sigs.id) AS total_signatures
            FROM
                user_profiles AS up
            LEFT JOIN
                documents AS docs ON up.id = docs.user_profile_id
            LEFT JOIN
                signatures AS sigs ON up.id = sigs.user_profile_id
            WHERE
                up.id = $1;
        `;

        const profileQueryResults = await client.query(profileQuery, [profileId]);

        if (profileQueryResults.rows.length === 0) {
            return res.status(204).json({ error: 'No data found for your profileId.' });
        }

        const { total_documents, total_signatures } = profileQueryResults.rows[0];

        res.status(200).json({
            message: 'profile data retrieved.',
            data: {
                totalDocuments: total_documents,
                totalSignatures: total_signatures,
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

const getUserPublicKeyAndAuthenticatedWalletByHashedEmail = async (req, res) => {
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
    createInitialUserTablesAndEmailAuthToken,
    addInitialUserProfileData,
    authenticateExistingCookie,
    removeAuthTokenCookie,
    authenticateLogin,
    updateDatabaseWithNewVerifiedXrplWalletAddress,
    getProfilePageData,
    getUserPublicKeyAndAuthenticatedWalletByHashedEmail,
};
