// /sigVerify-backend/routes/documentRoutes

import express from 'express';
import authenticateToken from '../middleware/authenticateToken.js';
import * as documentController from '../controllers/documentControllers.js';
import { authenticateExistingCookie } from '../controllers/userControllers.js';

const router = express.Router();

//! DEPRECATED: used for aws s3 bucket integration
// router.post('/api/documents', authenticateToken, upload.array('files'), documentController.uploadFiles);

// protected routes
router.get('/api/documents', authenticateToken, documentController.getAllUserDocumentsWithSignatureStatus);
router.post('/api/document/upload', authenticateToken, documentController.storeNewDocumentDataToIpfsAndDatabase);
router.post('/api/document/addSignature', authenticateToken, documentController.addDocumentSignature);

export default router;
