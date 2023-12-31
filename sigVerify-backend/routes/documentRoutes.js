// /sigVerify-backend/routes/documentRoutes

import express from 'express';
import authenticateToken from '../middleware/authenticateToken.js';
import * as documentController from '../controllers/documentControllers.js';
// ... other imports ...

const router = express.Router();

// uploaded files to server memory and then handling from there
// const multer = require('multer');
// const storage = multer.memoryStorage();
// const upload = multer({ storage: storage });

//upload files directly to s3 using multer-s3
import { upload } from '../config/s3Bucket.js';

// protected routes
router.get('/api/documents', authenticateToken, documentController.getAllUserDocuments);
router.post('/api/documents', authenticateToken, upload.array('files'), documentController.uploadFiles);


// old document routes
// router.post('/api/document/sign', upload.single('document'), xrplDocumentControllers.signDocument);
// router.post('/api/document/verify', upload.single('document'), xrplDocumentControllers.verifySignature);
// router.post('/api/document/fileUpload', upload.single('document'), xrplDocumentControllers.uploadFileToDb);
// router.post('/api/document/getAllUserDocuments', xrplDocumentControllers.getAllDocumentsUploadedByThisWallet);

export default router;
