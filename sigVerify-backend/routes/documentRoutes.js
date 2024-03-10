// /sigVerify-backend/routes/documentRoutes

import express from 'express';
import authenticateToken from '../middleware/authenticateToken.js';
import * as documentController from '../controllers/documentControllers.js';
import { authenticateExistingCookie } from '../controllers/userControllers.js';
//upload files directly to s3 using multer-s3
import { upload } from '../config/s3Bucket.js';

const router = express.Router();

// protected routes
router.get('/api/documents', authenticateToken, documentController.getAllUserDocumentsWithSignatureStatus);
router.post(
    '/api/document/upload',
    authenticateToken,
    upload.array('files'),
    documentController.uploadDocumentAndStoreDetails
);
router.post('/api/document/addSignature', authenticateToken, documentController.addDocumentSignature);

export default router;
