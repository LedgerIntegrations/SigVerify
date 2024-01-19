// /sigVerify-backend/routes/documentRoutes

import express from 'express';
import authenticateToken from '../middleware/authenticateToken.js';
import * as documentController from '../controllers/documentControllers.js';
import { authenticateExistingCookie } from '../controllers/userControllers.js';

const router = express.Router();

// protected routes
router.get('/api/documents', authenticateToken, documentController.getAllUserDocuments);
router.post('/api/documents', authenticateToken, upload.array('files'), documentController.uploadFiles);
router.post('/api/document/upload', authenticateToken, documentController.storeDocumentDataToIpfs);

export default router;
