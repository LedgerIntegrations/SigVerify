const express = require('express');
const router = express.Router();
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const documentController = require('../controllers/documentController');

//routes where a document is being sent in body as formData or returned
router.post('/api/document/sign', upload.single('document'), documentController.signDocument);
router.post('/api/document/verify', upload.single('document'), documentController.verifySignature);
router.post('/api/document/fileUpload', upload.single('document'), documentController.uploadFileToDb);
router.post('/api/document/getAllUserDocuments', documentController.getAllDocumentsUploadedByThisWallet);
module.exports = router;