// /sigVerify-backend/routes/documentRoutes

const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authenticateToken');
const documentControllers = require('../controllers/documentControllers');

// uploaded files to server memory and then handling from there
// const multer = require('multer');
// const storage = multer.memoryStorage();
// const upload = multer({ storage: storage });

//upload files directly to s3 using multer-s3
const { upload } = require('../config/s3Bucket');

// protected routes
router.post('/api/document/upload', upload.array('files'), authenticateToken, documentControllers.uploadFiles);
router.post(
    '/api/document/getAllDocuments',
    authenticateToken,
    documentControllers.getAllUsersDocumentsGivenTheirUserAuthId
);

// old document routes
// router.post('/api/document/sign', upload.single('document'), xrplDocumentControllers.signDocument);
// router.post('/api/document/verify', upload.single('document'), xrplDocumentControllers.verifySignature);
// router.post('/api/document/fileUpload', upload.single('document'), xrplDocumentControllers.uploadFileToDb);
// router.post('/api/document/getAllUserDocuments', xrplDocumentControllers.getAllDocumentsUploadedByThisWallet);

module.exports = router;
