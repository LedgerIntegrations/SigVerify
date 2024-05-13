import express from 'express';
import authenticateToken from '../middleware/authenticateToken.js';
import * as documentController from '../controllers/documentControllers.js';
import * as documentAccess from '../controllers/documentAccessController.js';

import { upload } from '../config/s3Bucket.js';
const router = express.Router();

//! - all routes (public and private) wrapped in axiosIntance allowing credentials(httpOnly cookie) -

//////////////////////////////////////////////////////////////////////////////

// * GET ROUTES
router.get('/api/document/public/:documentId', documentController.getPublicDocument);
router.get('/api/documents/public/email/:userEmail', documentController.getPublicDocumentsByUserEmail);

//! PROTECTED
router.get('/api/document/private/:documentId', authenticateToken, documentController.getPrivateDocument);
router.get('/api/documents/private/user', authenticateToken, documentController.getPrivateDocumentsForUser);
router.get('/api/documents/uploaded/user', authenticateToken, documentController.getAllUploadedDocumentsByUser);

//////////////////////////////////////////////////////////////////////////////

// * POST ROUTES
//! PROTECTED
router.post(
    '/api/document',
    authenticateToken,
    upload.array('files'),
    documentController.uploadDocumentAndStoreDetails
);

//////////////////////////////////////////////////////////////////////////////

// * PUT ROUTES
//! PROTECTED
// router.put('/api/document/:documentId', authenticateToken, documentController.updateDocument);

//////////////////////////////////////////////////////////////////////////////

// * DELETE ROUTES
//! PROTECTED ROUTES
router.delete(
    '/api/document/delete/unsent/:documentId',
    authenticateToken,
    documentController.deleteUnsentPrivateDocument
);

//////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////


//* DOCUMENT ACCESS ROUTES

//////////////////////////////////////////////////////////////////////////////

// * GET ROUTES
//! PROTECTED ROUTES
router.get('/api/document/access/:documentId', authenticateToken, documentAccess.getAccessObjectsByDocumentId);
router.get(
    '/api/documents/access/user',
    authenticateToken,
    documentAccess.getAllDocumentsUserWasGivenAccessTo
);
router.get(
    '/api/documents/access/all',
    authenticateToken,
    documentAccess.getAllGivenAccessAndUploadedDocuments
);

//////////////////////////////////////////////////////////////////////////////

// * POST ROUTES
//! PROTECTED ROUTES
router.post('/api/document/access', authenticateToken, documentAccess.addOrUpdateAccessToDocument);

//////////////////////////////////////////////////////////////////////////////

// * PUT ROUTES
//! PROTECTED ROUTES
// TODO: why using document controller for document access functionality
router.put('/api/document/access/disable/:documentId', authenticateToken, documentController.disableDocumentAccess);

//////////////////////////////////////////////////////////////////////////////

// * DELETE ROUTES
//! PROTECTED ROUTES
router.delete('/api/document/access/:accessId', authenticateToken, documentAccess.deleteDocumentAccessEntry);


//////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////

// * CONSTRUCTED DOCUMENT ROUTES
//////////////////////////////////////////////////////////////////////////////

// create constructed document

// modify constructed document

// 


export default router;
