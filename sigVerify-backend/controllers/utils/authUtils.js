// authUtils.js

import jwt from 'jsonwebtoken';

/**
 * Generates a JWT token for the user and sets it as an HTTP-only cookie.
 * @param {Object} res - The Express response object.
 * @param {String} profileId- The user's profile ID.
 */
const generateAndSetAuthToken = (res, profileId) => {
    const authToken = jwt.sign({ profileId }, process.env.JWT_SECRET, { expiresIn: '24h' });

    res.cookie('authToken', authToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });
};

export { generateAndSetAuthToken };
