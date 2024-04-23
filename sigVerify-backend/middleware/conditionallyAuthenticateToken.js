import jwt from 'jsonwebtoken';
import DocumentModel from '../models/Document.js';

const conditionallyAuthenticateToken = async (req, res, next) => {
    const { documentId } = req.params;
    if (!documentId) {
        return res.status(400).json({ error: 'Missing document id in the request.' });
    }

    try {
        const document = await DocumentModel.getAnyDocumentById(documentId);
        if (!document) {
            return res.status(404).json({ error: 'Document not found.' });
        }

        // Store document in request for later use to avoid re-fetching it
        req.document = document;

        // If the document is public, skip further token checks
        if (document.public) {
            return next();
        }

        // Document is private, proceed with token authentication
        const token = req.cookies ? req.cookies['authToken'] : null;
        if (!token) {
            return res.status(401).json({ error: 'No token provided for private document access.' });
        }

        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                if (err.name === 'TokenExpiredError') {
                    return res.status(401).json({ error: 'Token has expired.' });
                }
                return res.status(403).json({ error: 'Failed to authenticate token.' });
            }
            if (decoded.checksum !== process.env.JWT_CHECKSUM) {
                return res.status(401).json({ error: 'Invalid SigVerify authentication cookie.' });
            }

            // Token is valid, store user info in request object
            req.user = decoded;
            next();
        });
    } catch (error) {
        console.error('Error in conditional authentication:', error);
        return res.status(500).json({ error: 'Internal server error during authentication.' });
    }
};

export default conditionallyAuthenticateToken;
