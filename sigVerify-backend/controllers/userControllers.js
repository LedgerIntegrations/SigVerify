// /sigVerify-backend/controllers/userControllers

const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
// const emailer = require('../utils/sendGmail');
const emailer = require('../utils/sendMail');
require('dotenv').config();

//hard coded routes
const loginApiRoute = 'http://localhost:3001/api/user/login';
const loginClientRoute = 'http://localhost:5173/login-user';

const SIGNUP_TOKEN_LENGTH = 16;
const HTTP_OK = 200;
const HTTP_INTERNAL_SERVER_ERROR = 500;

//could hash password on front end before even sending in http request for higher security
async function hashEmail(email) {
    return crypto.createHash('sha256').update(email).digest('hex');
}

async function hashPassword(password) {
    return bcrypt.hash(password, 10);
}

const sendTokenAuthLinkEmail = async (email, token) => {
    return new Promise((resolve, reject) => {
        emailer.sendEmail(
            email,
            'SigVerify E-mail Verification',
            `Please Click Link to Verify email! \n http://localhost:5173/create-user/?token=${token}`,
            (err, res) => {
                if (err) {
                    console.log('The API returned an error:', err.message);
                    reject(err);
                } else {
                    console.log('Email sent:', res.data);
                    resolve(res);
                }
            }
        );
    });
};

exports.createInitalUserTablesAndEmailAuthToken = async (req, res) => {
    const { email } = req.body;
    const client = await pool.connect();

    try {
        await client.query('BEGIN');
        //
        const queryIsEmailInDb = `
            SELECT ua.auth_token
            FROM user_email ue
            JOIN user_meta um ON ue.user_meta_id = um.id
            JOIN user_auth ua ON um.user_auth_id = ua.id
            WHERE ue.email = $1 AND ua.auth_token IS NOT NULL;
        `;

        const returnedAuthTokenFromQueriedEmail = await client.query(queryIsEmailInDb, [email]);
        console.log('db user query by email response: ', returnedAuthTokenFromQueriedEmail);

        //if email is in db that is not verified
        if (returnedAuthTokenFromQueriedEmail.rows.length > 0) {
            const userAuthToken = returnedAuthTokenFromQueriedEmail.rows[0].auth_token;

            //if token exists in auth, email not verified --> send auth email
            if (userAuthToken !== null) {
                await sendTokenAuthLinkEmail(email, userAuthToken);
                return res.status(HTTP_OK).json({
                    userAuthenticated: false,
                    emailSent: true,
                    message: `Email was already registered but still needs to be verified. Re-sending authentication email to: ${email} .`,
                });
            }
            // email exists, and auth_token  === null --> account is already verified
            if (userAuthToken === null) {
                return res.status(HTTP_OK).json({
                    userAuthenticated: true,
                    emailSent: false,
                    message: `This email has already been authenticated! Please login at: ${loginClientRoute}`,
                });
            }
        }

        // email not found in db
        const newAuthToken = crypto.randomBytes(SIGNUP_TOKEN_LENGTH).toString('hex');
        const hashedEmail = await hashEmail(email);

        try {
            const newUserAuthTableEntryId = await client.query(
                'INSERT INTO user_auth (hashed_email, auth_token) VALUES ($1, $2) RETURNING id',
                [hashedEmail, newAuthToken]
            );
            console.log('newUserAuthTableEntryId result: ', newUserAuthTableEntryId);

            const newUserMetaTableEntryId = await client.query(
                'INSERT INTO user_meta (user_auth_id) VALUES ($1) RETURNING id',
                [newUserAuthTableEntryId.rows[0].id]
            );
            console.log('newUserMetaTableEntryId result: ', newUserMetaTableEntryId);

            await client.query('INSERT INTO user_email (user_meta_id, email) VALUES ($1, $2) RETURNING id', [
                newUserMetaTableEntryId.rows[0].id,
                email,
            ]);
        } catch (err) {
            if (err.code === '23505') {
                // Unique constraint error
                throw new Error('The provided email is already registered.');
            }
            throw err; // Re-throw other errors to be caught in the outer catch block
        }

        await client.query('COMMIT');
        console.log('Commit');
        await sendTokenAuthLinkEmail(email, newAuthToken);
        console.log('SendToken');
        return res.status(HTTP_OK).json({
            userAuthenticated: false,
            emailSent: true,
            message: `Email registered! Authentication e-mail sent to: ${email} .`,
        });
    } catch (err) {
        console.log('Error internal');
        await client.query('ROLLBACK');
        console.error('Error processing request', err);
        if (err.message === 'The provided email is already registered.') {
            return res.status(400).json({ error: err.message });
        }
        return res.status(HTTP_INTERNAL_SERVER_ERROR).json({ error: 'Internal server error' });
    } finally {
        console.log('Finally');
        client.release();
    }
};

exports.createNewUser = async (req, res) => {
    const { FirstName, LastName, Password, PasswordConfirm, Token } = req.body;
    console.log('createNewUser server function recieved body: ', req.body);

    if (!FirstName || !LastName || !Password || !Token || Password !== PasswordConfirm) {
        return res.status(400).json({
            error: 'Please provide all required fields and ensure passwords match.',
        });
    }

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Hash the password
        const hashedPassword = await hashPassword(Password);

        const authData = await client.query('SELECT * FROM user_auth WHERE auth_token = $1', [Token]);
        if (authData.rows.length === 0) {
            throw new Error('User with the provided email not found.');
        }

        const usersAuthData = authData.rows[0];

        if (usersAuthData.auth_token === null) {
            throw new Error('user is already created.');
        }

        const { id: user_auth_id } = usersAuthData;

        // Update user_meta details of entry that has FK user_auth_id matching our userAuthData.id
        await client.query('UPDATE user_meta SET first_name = $1, last_name = $2 WHERE user_auth_id = $3', [
            FirstName,
            LastName,
            user_auth_id,
        ]);

        // Update user_auth table with the hashed password
        await client.query('UPDATE user_auth SET hashed_password = $1 WHERE id = $2', [hashedPassword, user_auth_id]);

        // Verify user email
        await client.query('UPDATE user_auth SET auth_token = NULL WHERE id = $1', [user_auth_id]);

        // New query to fetch updated user data
        const newUserDataQuery = `
            SELECT
                ua.id,
                ua.auth_token,
                ua.hashed_password,
                um.first_name,
                um.membership
            FROM
                user_auth AS ua
            JOIN
                user_meta AS um ON um.user_auth_id = ua.id
            WHERE
                ua.hashed_email = $1;
        `;

        const newUserData = await client.query(newUserDataQuery, [user_auth_id]);

        if (newUserData.rows.length === 0) {
            throw new Error('User data not found by user_auth id.');
        }

        const user = newUserData.rows[0];

        await client.query('COMMIT');

        const token = jwt.sign(
            {
                userId: user.id,
                email: user.email,
            },
            process.env.JWT_SECRET,
            {
                expiresIn: '24h', // Expires in 24 hours
            }
        );

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV !== 'development', // send only on HTTPS (except in development)
            maxAge: 24 * 60 * 60 * 1000, // cookie expiry, set to match JWT expiry
        });

        // After setting the HTTP-only cookie, send a success response
        res.status(200).json({
            message: 'user creation successful',
            user: {
                id: user.id,
                firstName: user.first_name,
                membership: user.membership,
                // other non-sensitive fields
            },
        });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error processing request', err);
        return res.status(HTTP_INTERNAL_SERVER_ERROR).json({ error: err.message });
    } finally {
        client.release();
    }
};

exports.authenticateLogin = async (req, res) => {
    const { Email, Password } = req.body;
    console.log('user login credential on server:', Email, Password);

    if (!Email || !Password) {
        return res.status(400).json({
            error: 'Please provide both email and password.',
            loggedIn: false,
        });
    }

    const client = await pool.connect();

    try {
        const loginQuery = `
            SELECT
                ua.id,
                ua.auth_token,
                ua.hashed_password,
                um.first_name,
                um.membership
            FROM
                user_auth AS ua
            JOIN
                user_meta AS um ON um.user_auth_id = ua.id
            WHERE
                ua.hashed_email = $1;
        `;

        const hashedEmail = await hashEmail(Email);
        const userLoginResult = await client.query(loginQuery, [hashedEmail]);

        if (userLoginResult.rows.length === 0) {
            return res.status(401).json({ error: 'Email not found.', loggedIn: false });
        }

        const user = userLoginResult.rows[0];
        console.log('returned user in login function on server: ', user);

        // Check if the user's email is not verified (verified account has auth_token === null)
        if (user.auth_token !== null) {
            return res.status(401).json({
                error: 'Email is not verified. Please verify your email first.',
                loggedIn: false,
            });
        }

        // Check if account attached to email has entered their user info yet (if entered hashed_pw will not be null)
        if (user.hashed_password === null) {
            return res.status(401).json({
                error: 'Email verified but account not created, follow link from email again.',
                loggedIn: false,
            });
        }
        // Compare provided password with stored hashed password
        const isPasswordCorrect = await bcrypt.compare(Password, user.hashed_password);

        if (!isPasswordCorrect) {
            return res.status(401).json({ error: 'Invalid password.', loggedIn: false });
        }

        const authToken = jwt.sign(
            {
                userId: user.id,
                email: user.email,
            },
            process.env.JWT_SECRET,
            {
                expiresIn: '24h', // Expires in 24 hours
            }
        );

        console.log('res.cookie: :', res.cookie);
        console.log('token: ', authToken);

        res.cookie('authToken', authToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV !== 'development', // send only on HTTPS (except in development)
            maxAge: 24 * 60 * 60 * 1000, // cookie expiry, set to match JWT expiry
        });

        // After setting the HTTP-only cookie, send a success response
        res.status(200).json({
            message: 'Login successful',
            user: {
                id: user.id,
                firstName: user.first_name,
                membership: user.membership,
                // other non-sensitive fields
            },
        });
    } catch (err) {
        console.error('Error processing request', err);
        return res.status(500).json({ error: 'Internal server error inside user authenticateLogin' });
    } finally {
        client.release();
    }
};

exports.updateDatabaseWithNewVerifiedXrplWalletAddress = async (req, res) => {
    const { userId, newWalletAddress } = req.body;

    if (!userId || !newWalletAddress) {
        return res.status(400).json({
            error: 'Please provide both user ID and new XRPL wallet address.',
        });
    }

    const client = await pool.connect();

    try {
        const updateQuery = `
          UPDATE user_meta
          SET verified_xrpl_wallet_address = $1
          FROM user_auth
          WHERE user_meta.user_auth_id = user_auth.id
          AND user_auth.id = $2;
        `;

        await client.query(updateQuery, [newWalletAddress, userId]);

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
