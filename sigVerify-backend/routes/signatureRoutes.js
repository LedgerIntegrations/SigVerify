import express from 'express';
import authenticateToken from '../middleware/authenticateToken.js';
import conditionallyAuthenticateToken from '../middleware/conditionallyAuthenticateToken.js';
import * as signatureController from '../controllers/signatureControllers.js';

const router = express.Router();

// router.get('/api/signature/:signatureId', );

// * GET ROUTES
// router.get('/api/signatures/public/document/:documentId', signatureController.getPublicSignatures);
router.get(
    '/api/signatures/document/:documentId',
    conditionallyAuthenticateToken,
    signatureController.getDocumentSignatures
);

//! AUTHENTICATED ROUTES (MUST BE LOGGED IN)
// router.get('/api/signatures/private/document/:documentId', authenticateToken, signatureController.getPrivateSignatures);
router.get('/api/signatures/user', authenticateToken, signatureController.getSignaturesByUserProfileId);
router.get(
    '/api/signatures/status/document/:documentId',
    authenticateToken,
    signatureController.getDocumentSignatureStatus
);

// * POST ROUTES
router.post('/api/signature', signatureController.storeResolvedSignature);

export default router;
