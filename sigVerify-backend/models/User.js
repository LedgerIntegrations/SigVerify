// user interface to database

// imports
import pool from '../config/db.js';
import crypto from 'crypto';

// *helper queries

// convert hashed email to raw email
const convertHashedEmailToPlainText = async (hashedEmail) => {
    //     const client = await pool.connect();
    //     try {
    //         const hashedToPlainTextEmailQuery = `
    //             SELECT ucont.email
    //             FROM user_credentials uc
    //             JOIN user_profiles up ON uc.id = up.user_credentials_id
    //             JOIN user_contacts ucont ON up.id = ucont.user_profile_id
    //             WHERE uc.hashed_email = $1;
    //         `;
    //         const queryResults = await client.query(hashedToPlainTextEmailQuery, [hashedEmail]);
    //         return queryResults.rows[0].email;
    //     } catch (err) {
    //         throw new Error(err);
    //         console.error('Error processing request', err);
    //     } finally {
    //         client.release();
    //     }
};

const hashEmail = async (email) => {
    return crypto.createHash('sha256').update(email).digest('hex');
};

/**
 * Retrieves the user_profile_id corresponding to a given user_credentials_id.
 * @param {number} credentialsId - The ID from the user_credentials table.
 * @returns {Promise<number | null>} The user_profile_id or null if not found.
 */
async function getUserProfileIdByCredentialsId(credentialsId) {
    const query = `
    SELECT id FROM user_profiles WHERE user_credentials_id = $1;
  `;

    try {
        const res = await pool.query(query, [credentialsId]);
        if (res.rows.length > 0) {
            return res.rows[0].id; // Assuming user_credentials_id is unique and can only link to one profile
        } else {
            return null; // No matching user profile found
        }
    } catch (err) {
        console.error('Error retrieving user profile ID', err);
        throw err; // Rethrow or handle as appropriate for your application
    }
}

// ! all auth token funcitonality

// * select all credentials for matching token ✅
// * used in addding initial user profile data for new account if auth token found
const verifyUserToken = async (token) => {
    const client = await pool.connect();
    try {
        const { rows } = await client.query('SELECT id FROM user_credentials WHERE auth_token = $1', [token]);
        return rows.length > 0 ? rows[0].id : null;
    } finally {
        client.release();
    }
};

// * is email unauthenticated in database ✅
const authTokenStatus = async (email) => {
    const client = await pool.connect();

    try {
        // check if email is in database, if so return auth_token for that user
        const queryIsEmailInDb = `
            SELECT uc.auth_token
            FROM user_credentials uc
            JOIN user_profiles up ON uc.id = up.user_credentials_id
            JOIN user_contacts ucont ON up.id = ucont.user_profile_id
            WHERE ucont.email = $1;
        `;

        const result = await client.query(queryIsEmailInDb, [email]);
        // if user exists in contacts table
        if (result.rows.length > 0) {
            const authToken = result.rows[0].auth_token;

            if (authToken === null) {
                // if null, email has already been authenticated so return 1
                return 1;
            } else {
                // return 2 if user exists, but the email has not been authenticated yet
                return 2;
            }
        }
        // if email not found in contacts, return null
        return null;
    } catch (err) {
        console.error('Error processing request', err);
        throw new Error(err);
    } finally {
        client.release();
    }
};

// * return user email authentication token
// const getUsersAuthToken = async (userProfileId) => {
//     const client = await pool.connect();

//     try {
//         const returnUserCredentialsAuthTokenGivenProfileId = `
//             SELECT uc.auth_token
//             FROM user_credentials uc
//             JOIN user_profiles up ON uc.id = up.user_credentials_id
//             WHERE up.id = $1;
//         `;

//         const queryResults = await client.query(returnUserCredentialsAuthTokenGivenProfileId, [userProfileId]);

//         return queryResults.rows[0].auth_token;
//     } catch (err) {
//         throw new Error(err);
//         console.error('Error processing request', err);
//     } finally {
//         client.release();
//     }
// };

// return auth token if exists and is not null, AKA unauthorized email account
// const checkUserByEmail = async (email) => {
//     const client = await pool.connect();
//     try {
//         const query = `
//       SELECT ua.auth_token
//       FROM user_email ue
//       JOIN user_meta um ON ue.user_meta_id = um.id
//       JOIN user_auth ua ON um.user_auth_id = ua.id
//       WHERE ue.email = $1 AND ua.auth_token IS NOT NULL;
//     `;
//         const result = await client.query(query, [email]);
//         return result.rows.length > 0 ? result.rows[0].auth_token : null;
//     } finally {
//         client.release();
//     }
// };

// !-------------------

// * returns users hashed_password given hashed_email
const getUserPasswordByHashedEmail = async (hashedEmail) => {
    const client = await pool.connect();
    try {
        const passwordQuery = `
            SELECT uc.hashed_password
            FROM user_credentials AS uc
            WHERE uc.hashed_email = $1;
        `;
        const results = await client.query(passwordQuery, [hashedEmail]);
        if (results.rows.length > 0) {
            return results.rows[0].hashed_password; // Returns the hashed password
        } else {
            throw new Error('User not found.');
        }
    } catch (err) {
        console.error('Error processing request', err);
        throw err;
    } finally {
        client.release();
    }
};

// * find profile id of given hashed_email
const getProfileIdFromHashedEmail = async (hashedEmail) => {
    const client = await pool.connect();
    try {
        const userInfoQuery = `
            SELECT
                up.id
            FROM
                user_credentials AS uc
            JOIN
                user_profiles AS up ON up.user_credentials_id = uc.id
            WHERE
                uc.hashed_email = $1;
        `;
        const results = await client.query(loginQuery, [hashedEmail]);
        return results.rows[0];
    } catch (err) {
        throw new Error(err);
        console.error('Error processing request', err);
    } finally {
        client.release();
    }
};

// * find user profile by profile id
const getUserProfileDataById = async (userProfileId) => {
    const client = await pool.connect();
    try {
        const userInfoQuery = `
            SELECT
                uc.id AS user_credentials_id,
                uc.auth_token,
                uc.hashed_password, //TODO: remove password from query?
                uc.public_key,
                up.id AS user_profile_id,
                up.first_name,
                up.last_name,
                up.membership,
                xw.wallet_address
            FROM
                user_credentials AS uc
            JOIN
                user_profiles AS up ON up.user_credentials_id = uc.id
            LEFT JOIN
                xrpl_wallets AS xw ON up.id = xw.user_profile_id
            WHERE
                up.id = $1;
        `;
        const results = await client.query(userInfoQuery, [userProfileId]);
        if (results.rows.length === 0) {
            throw new Error('User not found.');
        }
        return results.rows[0];
    } catch (err) {
        console.error('Error processing request', err);
        throw new Error(err.message); // Modified to throw error with message property
    } finally {
        client.release();
    }
};


// * get a users public key and authenticated wallet data by hashed email
const getUserPublicKeyAndWalletByHashedEmail = async (hashedEmail) => {
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
                uc.hashed_email = $1;
        `;
        const result = await client.query(getPublicKeyQuery, [hashedEmail]);
        return result.rows[0];
    } catch (err) {
        throw new Error(err);
        console.error('Error processing request', err);
    } finally {
        client.release();
    }
};

// * get profile total documents and signatures
const getUserTotalDocsAndSignatures = async (userProfileId) => {
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
                signatures AS sigs ON up.id = sigs.user_id
            WHERE
                up.id = $1;
        `;
        const result = await client.query(profileQuery, [userProfileId]);
        return result.rows[0];
    } catch (err) {
        throw new Error(err);
        console.error('Error processing request', err);
    } finally {
        client.release();
    }
};

// * update authenticated wallet
const updateUserXrplWalletAddress = async (newWalletAddress, userProfileId) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // First, check if an XRPL wallet entry already exists for the userProfileId
        const checkQuery = `
            SELECT 1 FROM xrpl_wallets WHERE user_profile_id = $1;
        `;
        const checkResult = await client.query(checkQuery, [userProfileId]);

        if (checkResult.rows.length > 0) {
            // If an entry exists, update it
            const updateQuery = `
                UPDATE xrpl_wallets
                SET wallet_address = $1
                WHERE user_profile_id = $2;
            `;
            await client.query(updateQuery, [newWalletAddress, userProfileId]);
        } else {
            // If no entry exists, insert a new one
            const insertQuery = `
                INSERT INTO xrpl_wallets (wallet_address, user_profile_id)
                VALUES ($1, $2);
            `;
            await client.query(insertQuery, [newWalletAddress, userProfileId]);
        }

        await client.query('COMMIT');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error processing request', err);
        throw err; // It's better practice to rethrow the original error for upstream handling
    } finally {
        client.release();
    }
};


// ! CREATING NEW USER
// * creates initial registered email tables and authentication token for new account
const createNewUser = async (email, newAuthToken) => {
    const client = await pool.connect();
    const hashedEmail = await hashEmail(email);

    try {
        await client.query('BEGIN');

        // Insert into user_auth
        const newUserCredentialsTableEntryId = await client.query(
            'INSERT INTO user_credentials (hashed_email, auth_token) VALUES ($1, $2) RETURNING id',
            [hashedEmail, newAuthToken]
        );

        // Insert into user_meta
        const newUserProfilesTableEntryId = await client.query(
            'INSERT INTO user_profiles (user_credentials_id) VALUES ($1) RETURNING id',
            [newUserCredentialsTableEntryId.rows[0].id]
        );

        // Insert into user_email
        await client.query('INSERT INTO user_contacts (user_profile_id, email) VALUES ($1, $2) RETURNING id', [
            newUserProfilesTableEntryId.rows[0].id,
            email,
        ]);

        await client.query('COMMIT');
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};

// * updating user credentials for authenticated email, initial account password, and generated public key ✅
// TODO: optimize this in future to update specific row of credentials by name, value
const updateUserCredentials = async (userCredentialsId, hashedPassword, publicKey) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        await client.query(
            'UPDATE user_credentials SET hashed_password = $1, public_key = $2, auth_token = NULL WHERE id = $3',
            [hashedPassword, publicKey, userCredentialsId]
        );

        await client.query('COMMIT');
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};

// * adding basic new user creation profile data
const createUserProfile = async (userCredentialsId, firstName, lastName, membershipType = 'free') => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Check if a profile already exists
        const res = await client.query('SELECT id FROM user_profiles WHERE user_credentials_id = $1', [
            userCredentialsId,
        ]);

        if (res.rows.length > 0) {
            // Profile exists, so update it
            await client.query(
                'UPDATE user_profiles SET first_name = $2, last_name = $3, membership = $4 WHERE user_credentials_id = $1',
                [userCredentialsId, firstName, lastName, membershipType]
            );
        }

        await client.query('COMMIT');
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};

// create inital user registration tables

export {
    getUserProfileIdByCredentialsId,
    verifyUserToken,
    authTokenStatus,
    getUserPasswordByHashedEmail,
    getProfileIdFromHashedEmail,
    getUserProfileDataById,
    getUserPublicKeyAndWalletByHashedEmail,
    getUserTotalDocsAndSignatures,
    updateUserXrplWalletAddress,
    createNewUser,
    updateUserCredentials,
    createUserProfile,
};
