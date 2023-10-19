const pool = require('../config/db');
const crypto = require('crypto');
const bcrypt = require('bcrypt');

const TEMP_PASS_LENGTH = 8;
const SIGNUP_TOKEN_LENGTH = 16;
const TOKEN_EXPIRATION_HOURS = 1;

async function hashEmail(email) {
    return crypto.createHash('sha256').update(email).digest('hex');
}

async function hashPassword(password) {
    return bcrypt.hash(password, 10);
}

exports.createEmailAuthVerificationToken = async (req, res) => {
    const email = req.body.email;
    const tempPass = crypto.randomBytes(TEMP_PASS_LENGTH).toString('hex');
    const signUpToken = crypto.randomBytes(SIGNUP_TOKEN_LENGTH).toString('hex');

    try {
        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            // Check if email already exists in user_metas
            const checkEmail = await client.query('SELECT * FROM user_metas WHERE email = $1', [email]);
            if (checkEmail.rows.length > 0) {
                throw new Error('Email already exists');
            }

            const hashedEmail = await hashEmail(email);
            const hashedTempPass = await hashPassword(tempPass);

            const metaResult = await client.query('INSERT INTO user_metas (email) VALUES ($1) RETURNING user_meta_id', [email]);
            const user_meta_id = metaResult.rows[0].user_meta_id;

            const userResult = await client.query('INSERT INTO users (meta_id, email_hash, password) VALUES ($1, $2, $3) RETURNING user_id', [user_meta_id, hashedEmail, hashedTempPass]);
            const user_id = userResult.rows[0].user_id;

            const tokenExpiration = new Date();
            tokenExpiration.setHours(tokenExpiration.getHours() + TOKEN_EXPIRATION_HOURS);
            await client.query('INSERT INTO auth (hashed_email, hashed_temp_pass, sign_up_token, user_id, expires_at) VALUES ($1, $2, $3, $4, $5)', [hashedEmail, hashedTempPass, signUpToken, user_id, tokenExpiration]);

            await client.query('COMMIT');

            // Send email logic...
            // Send email to the user with the sign-up token (email sending service for this?)
            // The email will contain a link like: `https://yourwebsite.com/verify?token=${signUpToken}`

            res.status(200).json({ message: 'Registration successful. Check your email for verification.' });
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    } catch (err) {
        console.error('Error processing request', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Clicks this link in email sending to this route: `http://localhost:3001/api/user/verifyEmailAuthToken?token=${signUpToken}`
exports.verifyEmailAuthVerificationToken = async (req, res) => {
    const token = req.query.token;

    try {
        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            // Check token validity and expiration
            const authData = await client.query('SELECT * FROM auth WHERE sign_up_token = $1', [token]);
            if (authData.rows.length === 0) {
                throw new Error('Invalid token');
            };

            const tokenExpiryDate = new Date(authData.rows[0].expires_at);
            if (new Date() > tokenExpiryDate) {
                throw new Error('Token has expired');
            };

            // Check if user with the hashed_email already exists in `users`
            const userExists = await client.query('SELECT * FROM users WHERE email = $1', [authData.rows[0].hashed_email]);
            if (userExists.rows.length === 0) {
                // Only insert if the user doesn't exist
                await client.query('INSERT INTO users (email, password) VALUES ($1, $2)', [authData.rows[0].hashed_email, authData.rows[0].hashed_temp_pass]);
            };

            // Delete the entry from the auth table
            await client.query('DELETE FROM auth WHERE sign_up_token = $1', [token]);

            await client.query('COMMIT');

            res.status(200).json({ message: 'Email verified successfully.' });
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    } catch (err) {
        console.error('Error processing request', err);
        res.status(500).json({ error: 'Internal server error' });
    };
};
