const express = require('express');
const router = express.Router();
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const documentController = require('../controllers/documentController');

router.post('/api/sign', upload.single('document'), documentController.signDocument);
router.post('/api/verify', upload.single('document'), documentController.verifySignature);
router.post('/api/fileUpload', upload.single('document'), documentController.uploadFileToDb)
module.exports = router;