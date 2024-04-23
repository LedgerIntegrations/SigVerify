import jwt from 'jsonwebtoken';

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
            // handle specific JWT errors for expiration
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({ error: 'Token has expired.' });
            }
            return res.status(403).json({ error: 'Failed to authenticate token.' });
        }
      console.log('jwt decoded: ', decoded);

      // extra security layer to make sure jwt is valid sigverify issued
      if (decoded.checksum !== process.env.JWT_CHECKSUM) {
            return res.status(401).json({ error: 'Invalid SigVerify authentication cookie.' });
      }
        // Token is valid, store user info in request object
        req.user = decoded
        next();
    });
};

export default authenticateToken;
