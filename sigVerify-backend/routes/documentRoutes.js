const express = require('express');
const router = express.Router();
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const documentControllers = require('../controllers/documentControllers');
// const xrplDocumentControllers = require('../controllers/xrplDocumentControllers')

router.post('/api/document/upload', upload.array('files'), documentControllers.uploadFiles);
router.post('/api/document/getAllDocuments', documentControllers.getDocumentKeysByEmailAndReturnDocuments)

// old document routes
// router.post('/api/document/sign', upload.single('document'), xrplDocumentControllers.signDocument);
// router.post('/api/document/verify', upload.single('document'), xrplDocumentControllers.verifySignature);
// router.post('/api/document/fileUpload', upload.single('document'), xrplDocumentControllers.uploadFileToDb);
// router.post('/api/document/getAllUserDocuments', xrplDocumentControllers.getAllDocumentsUploadedByThisWallet);
module.exports = router;