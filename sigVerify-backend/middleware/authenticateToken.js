const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    console.log('token authentication middleware fired.');

    // Extract the token from the cookies
    const token = req.cookies ? req.cookies['authToken'] : null;

    // Check if token is not present
    if (!token) {
        return res.status(401).json({ error: 'No token provided.' });
    }

    // Verify the token
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ error: 'Failed to authenticate token.' });
        }

        // Token is valid, store user info in request object
        req.user = decoded;
        next();
    });
};

module.exports = authenticateToken;
