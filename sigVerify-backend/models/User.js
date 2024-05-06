import pool from '../config/db.js';
import crypto from 'crypto';

// * utility functions
/**
 * convert hashed email to raw email
 */
const convertHashedEmailToPlainText = async (hashedEmail) => {
    const client = await this.poolConnect();
    try {
        const hashedToPlainTextEmailQuery = `
                SELECT ucont.email
                FROM user_credentials uc
                JOIN user_profiles up ON uc.id = up.user_credentials_id
                JOIN user_contacts ucont ON up.id = ucont.user_profile_id
                WHERE uc.hashed_email = $1;
            `;
        const queryResults = await client.query(hashedToPlainTextEmailQuery, [hashedEmail]);
        return queryResults.rows[0].email;
    } catch (err) {
        throw new Error(err);
        console.error('Error processing request', err);
    } finally {
        client.release();
    }
};

/**
 * Helper function to hash email addresses.
 */
const hashEmail = (email) => {
    return crypto.createHash('sha256').update(email).digest('hex');
};

/**
 * Helper function to generate a unique token for authentication and password reset purposes.
 */
const generateToken = () => {
    return crypto.randomBytes(32).toString('hex');
};

class UserModel {
    static async poolConnect() {
        return pool.connect();
    }

    /**
     * Verifies the user token and returns the user's ID if valid.
     */
    static async verifyUserToken(token) {
        const client = await this.poolConnect();
        try {
            const { rows } = await client.query('SELECT id FROM user_credentials WHERE auth_token = $1', [token]);
            return rows.length > 0 ? rows[0].id : null;
        } catch (err) {
            console.error('Error verifying user token', err);
            throw new Error('Error verifying user token');
        } finally {
            client.release();
        }
    }

    /**
     * Finds a user by their auth token.
     */
    static async findCredentialsByAuthToken(token) {
        const client = await this.poolConnect();
        try {
            const { rows } = await client.query('SELECT * FROM user_credentials WHERE auth_token = $1', [token]);
            return rows.length > 0 ? rows[0] : null;
        } catch (err) {
            console.error('Error finding user by auth token', err);
            throw new Error('Error finding user by auth token');
        } finally {
            client.release();
        }
    }

    /**
     * Creates initial user profile tables (credentials, profile, and email) with registered email.
     */
    static async initializeUserRegistration(email) {
        const client = await this.poolConnect();
        const hashedEmail = await hashEmail(email);
        const newAuthToken = await generateToken();

        try {
            await client.query('BEGIN');

            // Insert into user_credentials
            const newUserCredentialsRes = await client.query(
                'INSERT INTO user_credentials (hashed_email, auth_token) VALUES ($1, $2) RETURNING id',
                [hashedEmail, newAuthToken]
            );

            const userCredentialsId = newUserCredentialsRes.rows[0].id;

            // Insert into user_profiles
            const newUserProfileRes = await client.query(
                'INSERT INTO user_profiles (user_credentials_id) VALUES ($1) RETURNING id',
                [userCredentialsId]
            );

            const userProfileId = newUserProfileRes.rows[0].id;

            // Insert into user_contacts
            await client.query('INSERT INTO user_contacts (user_profile_id, email) VALUES ($1, $2) RETURNING id', [
                userProfileId,
                email,
            ]);

            await client.query('COMMIT');
            return newAuthToken;
        } catch (err) {
            await client.query('ROLLBACK');
            console.error('Error creating new user', err);
            throw err;
        } finally {
            client.release();
        }
    }

    /**
     * Updates the existing user profile data with the information submitted from the form.
     */
    static async finalizeUserRegistration(token, firstName, lastName, membershipType = 'free') {
        const client = await this.poolConnect();

        try {
            await client.query('BEGIN');

            // Use the existing findByAuthToken method to get user credentials
            const userCredentials = await this.findCredentialsByAuthToken(token);
            console.log('credentials response inside finalise reg: ', userCredentials);
            if (!userCredentials) {
                throw new Error('Invalid or expired authentication token.');
            }

            // Update the user_profiles with firstName, lastName, and membershipType
            const profileUpdateRes = await client.query(
                `UPDATE user_profiles SET first_name = $1, last_name = $2, membership = $3
                WHERE user_credentials_id = $4 RETURNING id`,
                [firstName, lastName, membershipType, userCredentials.id]
            );

            if (profileUpdateRes.rows.length === 0) {
                throw new Error('User profile could not be updated.');
            }

            // set auth_token to NULL, representing the email being authenticated
            await client.query('UPDATE user_credentials SET auth_token = NULL WHERE id = $1', [userCredentials.id]);

            await client.query('COMMIT');

            return profileUpdateRes.rows[0]; // Return the updated profile
        } catch (err) {
            await client.query('ROLLBACK');
            console.error('Error updating user profile', err);
            throw err;
        } finally {
            client.release();
        }
    }

    static async updateResetPasswordToken(userId, resetPwToken) {
        const client = await this.poolConnect();
        try {
            await client.query('BEGIN');
            const query = `
                UPDATE user_credentials
                SET reset_pw_token = $1, reset_pw_sent_at = NOW()
                WHERE id = $2 RETURNING *;
            `;
            const { rows } = await client.query(query, [resetPwToken, userId]);
            await client.query('COMMIT');
            return rows[0];
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    }

    static async updateSignInStamps(profileId, currentSignInIp) {
        const client = await this.poolConnect();
        try {
            await client.query('BEGIN');
            const query = `
                UPDATE user_credentials
                SET sign_in_count = sign_in_count + 1,
                    last_sign_in_at = current_sign_in_at,
                    current_sign_in_at = NOW(),
                    last_sign_in_ip = current_sign_in_ip,
                    current_sign_in_ip = $1
                WHERE id = $2 RETURNING *;
            `;
            const { rows } = await client.query(query, [currentSignInIp, profileId]);
            await client.query('COMMIT');
            return rows[0];
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    }
    // TODO: paramater value needs to be thought through, ip? email?
    static async recordFailedAttempt(emailHash) {
        const client = await this.poolConnect();
        try {
            await client.query('BEGIN');
            const query = `
                UPDATE user_credentials
                SET failed_attempts = failed_attempts + 1
                WHERE hashed_email = $1 RETURNING *;
            `;
            const { rows } = await client.query(query, [emailHash]);
            await client.query('COMMIT');
            return rows[0];
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    }

    // TODO: paramater value needs to be thought through, ip? email? profileId? send email to verify
    static async lockAccount(profileId) {
        const client = await this.poolConnect();
        try {
            await client.query('BEGIN');
            const query = `
                UPDATE user_credentials
                SET locked_at = NOW()
                WHERE id = $1 RETURNING *;
            `;
            const { rows } = await client.query(query, [profileId]);
            await client.query('COMMIT');
            return rows[0];
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    }

    /**
     * Updates user credentials upon email verification, setting a hashed password and public key, and clearing the auth token.
     */
    static async updateCredentials(id, { hashedPassword, publicKey }) {
        const client = await this.poolConnect();

        try {
            await client.query('BEGIN');

            const { rows } = await pool.query(
                'UPDATE user_credentials SET hashed_password = $1, public_key = $2, auth_token = NULL WHERE id = $3 RETURNING *',
                [hashedPassword, publicKey, id]
            );

            await client.query('COMMIT');

            return rows[0];
        } catch (err) {
            await client.query('ROLLBACK');
            console.error('Error updating user credentials', err);
            throw new Error('Error updating user credentials');
        } finally {
            client.release();
        }
    }

    /**
     * Initiates a password reset process by setting a reset password token and its timestamp.
     */
    static async initiatePasswordReset(email) {
        const client = await this.poolConnect();
        try {
            await client.query('BEGIN');
            const hashedEmail = hashEmail(email);
            const resetPwToken = generateToken();
            const { rows } = await client.query(
                'UPDATE user_credentials SET reset_pw_token = $1, reset_pw_sent_at = NOW() WHERE hashed_email = $2 RETURNING *',
                [resetPwToken, hashedEmail]
            );
            await client.query('COMMIT');
            return rows.length > 0 ? rows[0] : null;
        } catch (err) {
            await client.query('ROLLBACK');
            console.error('Error initiating password reset', err);
            throw new Error('Error initiating password reset');
        } finally {
            client.release();
        }
    }

    /**
     * Completes the password reset process by updating the user's password and clearing the reset password token and timestamp.
     */
    static async completePasswordReset(token, newPassword) {
        const client = await this.poolConnect();
        try {
            await client.query('BEGIN');
            const hashedPassword = crypto.createHash('sha256').update(newPassword).digest('hex');
            const { rows } = await client.query(
                'UPDATE user_credentials SET hashed_password = $1, reset_pw_token = NULL, reset_pw_sent_at = NULL WHERE reset_pw_token = $2 RETURNING *',
                [hashedPassword, token]
            );
            await client.query('COMMIT');
            return rows.length > 0 ? rows[0] : null;
        } catch (err) {
            await client.query('ROLLBACK');
            console.error('Error completing password reset', err);
            throw new Error('Error completing password reset');
        } finally {
            client.release();
        }
    }

    /**
     * Upgrades the user's membership type.
     * @param {number} userProfileId - The ID of the user profile to upgrade.
     * @param {string} newMembershipType - The new membership type ('free', 'standard', 'premium', 'business').
     * @returns {Promise<Object>} The updated user profile data.
     **/
    // *when membership is updated, postgresql set_document_limit_before_update trigger runs to also update the maximum_documents property
    static async upgradeMembership(userProfileId, newMembershipType) {
        const client = await this.poolConnect();
        try {
            const updateQuery = `
                UPDATE user_profiles
                SET membership = $1
                WHERE id = $2
                RETURNING *;
            `;
            const { rows } = await client.query(updateQuery, [newMembershipType, userProfileId]);

            if (rows.length === 0) {
                throw new Error(`User profile not found for ID ${userProfileId}.`);
            }

            return rows[0]; // Return the updated user profile
        } catch (err) {
            console.error('Error upgrading user membership', err);
            throw new Error('Error upgrading user membership');
        } finally {
            client.release();
        }
    }

    /**
     * Retrieves the user_profile_id corresponding to a given user_credentials_id.
     */
    static async getUserProfileIdByCredentialsId(credentialsId) {
        const client = await this.poolConnect();
        try {
            const { rows } = await client.query('SELECT id FROM user_profiles WHERE user_credentials_id = $1', [
                credentialsId,
            ]);
            return rows.length > 0 ? rows[0].id : null;
        } catch (err) {
            console.error('Error retrieving user profile ID', err);
            throw new Error('Error retrieving user profile ID');
        } finally {
            client.release();
        }
    }

    /**
     * Checks the authentication token status for a given email.
     */
    static async getAuthTokenByHashedEmail(hashedEmail) {
        const client = await this.poolConnect();
        try {
            const result = await client.query('SELECT * FROM user_credentials WHERE hashed_email = $1', [hashedEmail]);
            if (result.rows.length > 0) {
                return result.rows[0];
            }
            return 1; // Email not found / registered yet
        } catch (err) {
            console.error('Error checking auth token status', err);
            throw new Error('Error checking auth token status');
        } finally {
            client.release();
        }
    }

    /**
     * Retrieves the user's hashed password by their hashed email.
     */
    static async getUserPasswordByHashedEmail(hashedEmail) {
        const client = await this.poolConnect();
        try {
            const { rows } = await client.query(
                'SELECT hashed_password FROM user_credentials WHERE hashed_email = $1',
                [hashedEmail]
            );
            return rows.length > 0 ? rows[0].hashed_password : null;
        } catch (err) {
            console.error('Error getting user password by hashed email', err);
            throw new Error('Error getting user password by hashed email');
        } finally {
            client.release();
        }
    }

    /**
     * Finds the profile ID associated with a given hashed email.
     */
    static async getProfileIdFromHashedEmail(hashedEmail) {
        const client = await this.poolConnect();
        try {
            const { rows } = await client.query(
                `SELECT up.id FROM user_profiles up
                 JOIN user_credentials uc ON up.user_credentials_id = uc.id
                 WHERE uc.hashed_email = $1`,
                [hashedEmail]
            );
            return rows.length > 0 ? rows[0].id : null;
        } catch (err) {
            console.error('Error finding profile ID from hashed email', err);
            throw new Error('Error finding profile ID from hashed email');
        } finally {
            client.release();
        }
    }

    /**
     * Retrieves user profile data by profile ID, including credentials and any associated XRPL wallet address.
     * main profile data used for front end ui
     */
    static async getUserProfileData(userProfileId) {
        console.log('user profile id: ', userProfileId);
        const client = await this.poolConnect();
        try {
            const { rows } = await client.query(
                `SELECT
            uc.public_key,
            up.id as profile_id,
            up.first_name,
            up.last_name,
            up.membership,
            up.document_limit,
            xw.wallet_address,
            ucot.email
            FROM
                user_profiles up
            JOIN
                user_credentials uc ON up.user_credentials_id = uc.id
            LEFT JOIN
                xrpl_wallets xw ON up.id = xw.user_profile_id
            LEFT JOIN
                user_contacts ucot ON up.id = ucot.user_profile_id
            WHERE
            up.id = $1;`,
                [userProfileId]
            );
            if (rows.length === 0) {
                throw new Error('User not found.');
            }
            return rows[0];
        } catch (err) {
            console.error('Error retrieving user profile data by ID', err);
            throw new Error(err.message);
        } finally {
            client.release();
        }
    }

    static async getDocumentLimit(userProfileId) {
        const client = await this.poolConnect();
        try {
            const query = `
            SELECT document_limit
            FROM user_profiles
            WHERE id = $1;
        `;
            const { rows } = await client.query(query, [userProfileId]);
            if (rows.length === 0) {
                throw new Error('User profile not found.');
            }
            return rows[0].document_limit; // Assuming document_limit is directly stored in the user_profiles table
        } catch (err) {
            console.error('Error retrieving document limit', err);
            throw new Error('Error retrieving document limit');
        } finally {
            client.release();
        }
    }

    /**
     * Gets a user's public key and associated wallet data by their hashed email.
     */
    static async getUserPublicKeyAndWalletByHashedEmail(hashedEmail) {
        const client = await this.poolConnect();
        try {
            const { rows } = await client.query(
                `SELECT uc.public_key, xw.wallet_address FROM user_credentials uc
            JOIN user_profiles up ON uc.id = up.user_credentials_id
            LEFT JOIN xrpl_wallets xw ON up.id = xw.user_profile_id
            WHERE uc.hashed_email = $1`,
                [hashedEmail]
            );
            return rows.length > 0 ? rows[0] : null;
        } catch (err) {
            console.error('Error retrieving user public key and wallet by hashed email', err);
            throw new Error('Error retrieving user public key and wallet by hashed email');
        } finally {
            client.release();
        }
    }

    /**
     * Gets the total number of documents and signatures associated with a user profile.
     */
    static async getUserTotalDocsAndSignatures(userProfileId) {
        const client = await this.poolConnect();
        try {
            const { rows } = await client.query(
                `SELECT COUNT(DISTINCT docs.id) AS total_documents, COUNT(DISTINCT sigs.id) AS total_signatures
                FROM user_profiles up
                LEFT JOIN documents docs ON up.id = docs.user_profile_id
                LEFT JOIN signatures sigs ON docs.id = sigs.document_id
                WHERE up.id = $1 GROUP BY up.id;`,
                [userProfileId]
            );
            return rows.length > 0 ? rows[0] : { total_documents: 0, total_signatures: 0 };
        } catch (err) {
            console.error('Error retrieving total documents and signatures', err);
            throw new Error('Error retrieving total documents and signatures');
        } finally {
            client.release();
        }
    }

    static async getEmailByProfileId(profileId) {
        const client = await this.poolConnect();

        try {
            const result = await client.query(`SELECT email FROM user_contacts WHERE user_profile_id = $1`, [
                profileId,
            ]);
            return result.rows.length > 0 ? result.rows[0].email : null;
        } catch (error) {
            console.error('Error retrieving email by profile ID', error);
            throw error;
        } finally {
            client.release();
        }
    }

    static async findUserXrplWallet(profileId) {
        const client = await this.poolConnect();
        try {
            const res = await client.query('SELECT * FROM xrpl_wallets WHERE user_profile_id = $1', [profileId]);
            return res.rows[0]; // Return the first row (wallet) if exists, or undefined
        } finally {
            client.release();
        }
    }

    static async addOrUpdateUserXrplWallet(newWalletAddress, userProfileId) {
        const existingWallet = await this.findUserXrplWallet(userProfileId);
        const client = await this.poolConnect();
        try {
            await client.query('BEGIN');
            if (existingWallet) {
                await client.query(`UPDATE xrpl_wallets SET wallet_address = $1 WHERE user_profile_id = $2`, [
                    newWalletAddress,
                    userProfileId,
                ]);
            } else {
                await client.query(`INSERT INTO xrpl_wallets (user_profile_id, wallet_address) VALUES ($1, $2)`, [
                    userProfileId,
                    newWalletAddress,
                ]);
            }
            await client.query('COMMIT');
            return true;
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    }

    static async deleteUserXrplWallet(userProfileId) {
        const client = await this.poolConnect();
        try {
            await client.query('BEGIN');

            // Delete the wallet address associated with the user profile ID
            const deleteQuery = `DELETE FROM xrpl_wallets WHERE user_profile_id = $1`;
            const result = await client.query(deleteQuery, [userProfileId]);

            await client.query('COMMIT');

            // Return the number of rows deleted to confirm the operation
            return result.rowCount;
        } catch (err) {
            await client.query('ROLLBACK');
            console.error('Error deleting user XRPL wallet:', err);
            throw err;
        } finally {
            client.release();
        }
    }
}

export default UserModel;
