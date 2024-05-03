// /sigVerify-backend/controllers/userControllers
import pool from '../config/db.js';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { sendAuthTokenEmail } from './helpers/index.js';
import { generateJwtAndSetAsAuthTokenCookie } from './utils/authUtils.js';
import UserModel from '../models/User.js';
import SignatureModel from '../models/Signature.js';
import DocumentModel from '../models/Document.js';

dotenv.config();

const SIGNUP_TOKEN_LENGTH = 32;
const HTTP_OK = 200;
const HTTP_INTERNAL_SERVER_ERROR = 500;

// * UTILITY FUNCTIONS
// * ------------------------------------------------
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
        const userCredentials = await UserModel.getAuthTokenByHashedEmail(hashedEmail);
        // user exists, but the email has not been authenticated yet
        if (typeof userCredentials.auth_token === 'string') {
            // * send new email with link to authenticate and exit function
            await sendAuthTokenEmail(email, userCredentials.auth_token);

            return res.status(HTTP_OK).json({
                userAuthenticated: false,
                emailSent: true,
                message: `Email was already registered but still needs to be verified. Re-sending authentication email to: ${email}.`,
            });
        }
        // email has already been authenticated
        if (userCredentials.auth_token === null) {
            // * send response user already authenticated and exists, exit
            return res.status(HTTP_OK).json({
                userAuthenticated: true, // Assuming this should be true if authenticated
                emailSent: false,
                message: 'This email is already registered and authenticated, proceed to login.',
            });
        }
        // user email doesn't exist in database
        if (userCredentials === 1) {
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
        return res
            .status(HTTP_INTERNAL_SERVER_ERROR)
            .json({ error: 'Internal server error inside user registration.' });
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
        // *order matters here, have to finalize to find matching token before switching token to null in updateCredentials
        await UserModel.finalizeUserRegistration(token, firstName, lastName);
        await UserModel.updateCredentials(userCredentialsId, { hashedPassword, publicKey });

        //get profile id from credentials id
        const userProfileId = await UserModel.getUserProfileIdByCredentialsId(userCredentialsId);
        const userProfileData = await UserModel.getUserProfileData(userProfileId);
        const userEmail = await UserModel.getEmailByProfileId(userProfileId);

        if (userProfileId && userEmail) {
            // Use the utility function to generate and set the http only authToken cookie
            await generateJwtAndSetAsAuthTokenCookie(res, userProfileId, userEmail);
        }

        res.status(200).json({
            message: 'New user created successfully.',
            user: userProfileData,
        });
    } catch (err) {
        console.error('Error processing request', err);
        return res.status(500).json({ error: 'Internal server error inside complete user registration.' });
    }
};

// used when a user revisits application with a cookie still in browser to bypass login page ✅
const authenticateExistingCookie = async (req, res) => {
    const profileId = req.user.profileId;

    try {
        const profileData = await UserModel.getUserProfileData(profileId);

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

        const userCredentials = await UserModel.getAuthTokenByHashedEmail(hashedEmail);
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
        const userProfileData = await UserModel.getUserProfileData(userProfileId);
        const userEmail = await UserModel.getEmailByProfileId(userProfileId);

        if (userProfileId && userEmail) {
            // Use the utility function to generate and set the http only authToken cookie
            await generateJwtAndSetAsAuthTokenCookie(res, userProfileId, userEmail);
        }

        res.status(200).json({
            message: 'Login successful',
            user: userProfileData,
        });
    } catch (err) {
        console.error('Error processing login request:', err);
        if (err.code === 'ENOTFOUND') {
            res.status(500).json({
                error: 'Failed to connect to the database. Please check your network or database server.',
                loggedIn: false,
            });
        } else {
            res.status(500).json({
                error: 'Internal server error while processing your login. Please try again later.',
                loggedIn: false,
            });
        }
    }
};

const addOrUpdateXrplWalletAddress = async (req, res) => {
    const profileId = req.user.profileId;
    const { newWalletAddress } = req.body;

    if (!profileId || !newWalletAddress) {
        return res.status(400).json({ error: 'Missing user ID or new XRPL wallet address.' });
    }

    try {
        const success = await UserModel.addOrUpdateUserXrplWallet(newWalletAddress, profileId);

        if (success) {
            return res.status(200).json({ message: 'XRPL wallet address added/updated successfully.' });
        } else {
            return res.status(500).json({ message: 'Failed to add/update XRPL wallet address.' });
        }
    } catch (err) {
        console.error('Error processing request', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

const deleteXrplWalletAddress = async (req, res) => {
    const profileId = req.user.profileId;

    if (!profileId) {
        return res.status(400).json({ error: 'Missing user profile ID.' });
    }

    try {
        const deletedCount = await UserModel.deleteUserXrplWallet(profileId);

        if (deletedCount > 0) {
            return res.status(200).json({ message: 'XRPL wallet address deleted successfully.' });
        } else {
            return res.status(404).json({ message: 'No XRPL wallet address found for the user.' });
        }
    } catch (err) {
        console.error('Error processing request:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};


const upgradeMembership = async (req, res) => {
    const { profileId } = req.user;
    const { newMembershipType } = req.body;

    // Validate the new membership type
    const allowedMembershipTypes = ['free', 'standard', 'premium', 'business'];
    if (!allowedMembershipTypes.includes(newMembershipType)) {
        return res.status(400).json({
            error: 'Invalid membership type provided.',
        });
    }

    try {
        // Call the model method to upgrade membership
        await UserModel.upgradeMembership(profileId, newMembershipType);

        return res.status(200).json({
            message: `Membership upgraded successfully to ${newMembershipType}.`,
        });
    } catch (error) {
        console.error('Error upgrading membership:', error);
        return res.status(500).json({
            error: 'Failed to upgrade membership.',
        });
    }
};

const getUserProfileData = async (req, res) => {
    const profileId = req.user.profileId;
    try {
        const profileData = await UserModel.getUserProfileData(profileId);
        const totalUploadedDocuments = await DocumentModel.getAllUploadedDocuments(profileId);
        const totalSignatures = await SignatureModel.getSignaturesByUserProfileId(profileId);

        const customProfileDate = {
            ...profileData,
            total_documents: totalUploadedDocuments.length,
            total_signatures: totalSignatures.length,
        };

        res.status(200).json({
            data: customProfileDate,
        });
    } catch (err) {
        console.error('Error processing request', err);
        return res.status(500).json({ error: 'Internal server error inside getUserProfileData controller.' });
    }
};

const getUserSignatures = async (req, res) => {
    const profileId = req.user.profileId;
    try {
        const signatures = await SignatureModel.getSignaturesByUserProfileId(profileId);

        res.status(200).json({
            data: signatures,
        });
    } catch (err) {
        console.error('Error processing request', err);
        return res.status(500).json({ error: 'Internal server error inside getUserSignatures controller.' });
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
                xw.wallet_address
            FROM
                user_credentials uc
            JOIN
                user_profiles up ON uc.id = up.user_credentials_id
            LEFT JOIN
                xrpl_wallets xw ON up.id = xw.user_profile_id
            WHERE
                uc.hashed_email = $1
            ORDER BY
                xw.created_at DESC
            LIMIT 1;
        `;

        const userPublicKeyResult = await client.query(getPublicKeyQuery, [requestedEmailHash]);

        if (userPublicKeyResult.rows.length === 0) {
            return res.status(401).json({ error: 'This email is not found in our database.' });
        }

        const user = userPublicKeyResult.rows[0];

        res.status(200).json({
            message: 'Found user public key and verified wallet.',
            data: {
                publicKey: user.public_key,
                verifiedWallet: user.wallet_address,
            },
        });
    } catch (err) {
        console.error('Error processing request in getting user data', err);
        return res.status(500).json({ error: 'Internal server error querying user data' });
    } finally {
        client.release();
    }
};

const getUserEmail = async (req, res) => {
    const email = req.user.email;

    if (email) {
        res.status(200).json({
            email,
        });
    } else {
        return res.status(401).json({ error: 'email not found for this profile.' });
    }
};

export {
    registerUser,
    completeUserRegistration,
    authenticateLogin,
    getUserProfileData,
    authenticateExistingCookie,
    removeAuthTokenCookie,
    addOrUpdateXrplWalletAddress,
    getUserPublicKeyAndXrplWalletByHashedEmail,
    getUserEmail,
    getUserSignatures,
    upgradeMembership,
    deleteXrplWalletAddress,
};
