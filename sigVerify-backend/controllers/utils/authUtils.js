// authUtils.js

import jwt from 'jsonwebtoken';

/**
 * Generates a JWT token for the user and sets it as an HTTP-only cookie.
 * @param {Object} res - The Express response object.
 * @param {String} profileId- The user's profile ID.
 */
const generateJwtAndSetAsAuthTokenCookie = (res, profileId, userEmail) => {
    const authToken = jwt.sign({ profileId: profileId, email: userEmail, checksum: process.env.JWT_CHECKSUM  }, process.env.JWT_SECRET, { expiresIn: '24h' });

    res.cookie('authToken', authToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        maxAge: 4 * 60 * 60 * 1000, // 4 hours
    });
};

export { generateJwtAndSetAsAuthTokenCookie };
