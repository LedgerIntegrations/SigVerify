// SigVerify/sigVerify-backend/controllers/documentControllers.js

import { returnSignedUrlFromS3BucketKey } from '../config/s3Bucket.js';
import { pinata } from '../config/pinataConnect.js';
import crypto from 'crypto';

import Document as DocumentModel from '../models/Document.js';
import S3MappingModel from '../models/s3Mapping.js'

//* Helper function: returns crypto module sha256 hash of given string (used for email)
async function hashStringUsingSha256(string) {
    return crypto.createHash('sha256').update(string).digest('hex');
}

const uploadDocumentAndStoreDetails = async (req, res) => {
  try {
    const profileId = req.user.profileId; // applied to req object by auth middleware
    const { title, description, category } = req.body;
    const files = req.files; // The file/s uploaded to S3, provided by multer-s3

    // Perform the document creation, e.g., using DocumentModel (not shown here)
    const document = await DocumentModel.createDocument({
      userProfileId: profileId,
      title,
      description,
      category,
      // Add additional fields as necessary
    });

    // For each file, create an entry in document_s3_mapping
    for (const file of files) {
     await S3MappingModel.create({
        document_id: document.id,
        // s3_bucket_id: s3BucketId, // Use the actual S3 bucket ID here
        s3_object_key: file.key, // 'key' is provided by multer-s3
        s3_object_url: file.location // 'location' is the URL of the file in S3
    });
    }

    res.status(201).json({
      message: 'Document uploaded and details stored successfully',
      document: document, // Consider including some S3 file details if necessary
    });
  } catch (error) {
    console.error('Error in uploadDocumentAndStoreDetails:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// controllers/documentController.js

const createDocument = async (req, res) => {
  try {
    const document = await Document.createDocument(req.body);
    res.status(201).json(document);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getDocumentsByUserId = async (req, res) => {
  try {
    const documents = await Document.getDocumentsByUserId(req.params.userProfileId);
    res.json(documents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateDocument = async (req, res) => {
  try {
    const document = await Document.updateDocument(req.params.documentId, req.body);
    res.json(document);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteDocument = async (req, res) => {
  try {
    const document = await Document.deleteDocument(req.params.documentId);
    res.json(document);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export {
  uploadDocumentAndStoreDetails ,
  createDocument,
  getDocumentsByUserId,
  updateDocument,
  deleteDocument
};

// // ! reimplementation of document upload with s3
// const uploadFiles = async (req, res) => {
//     const userId = req.user.userId;
//     const files = req.files;
//     const customFormData = JSON.parse(req.body.customFormData);

//     console.log('document controllers files log: ', files);
//     console.log('custom form data: ', customFormData);

//     if (!files || files.length === 0) {
//         return res.status(400).json({ error: 'No files provided' });
//     }

//     let client;
//     try {
//         client = await pool.connect();
//         await client.query('BEGIN');
//         const userMetaId = await convertUserAuthIdToUserMetaId(client, userId);

//         for (const file of files) {
//             await insertDocumentDetails(client, userMetaId, file, customFormData);
//         }

//         await client.query('COMMIT');
//         res.status(200).json({ message: 'Files uploaded successfully' });
//     } catch (error) {
//         console.error('Error while uploading files:', error.message);
//         await client.query('ROLLBACK');
//         res.status(500).json({ error: 'Internal Server Error' });
//     } finally {
//         if (client) {
//             client.release();
//         }
//     }
// };

// const storeNewDocumentDataToIpfsAndDatabase = async (req, res) => {
//     try {
//         //* Extract and process data from request body
//         const {
//             originalFileName,
//             originalFileFormat,
//             originalFileSize,
//             base64EncodedSha512HashOfOriginalFileArrayBuffer,
//             requiredSignersWallets,
//             author,
//             metadata,
//             encrypted,
//             data,
//         } = req.body;

//         let allInvolvedEmailsArray = encrypted ? Object.keys(data.accessControls) : data.accessControls;

//         //* Construct the metadata object based on encrypted or unencrypted schema
//         let documentMetadata = {
//             schema: encrypted
//                 ? 'ipfs://Qma6Tnpzycw36LhFarF8gEwFRWrLSxmosi27S6Mh8zSBxn'
//                 : 'ipfs://QmZytGcRCzrDVTnMrfD1xbznz38HtiyoSCPLwRvGqY5Mty',
//             nftType: encrypted ? 'encrypted_document.v0' : 'document.v0',
//             name: metadata.title || 'Untitled Document',
//             description: metadata.description || 'No description provided',
//             image: 'ipfs://QmcqQ4W2pFFuQg5jcdzBXE9Jm566yCgX43dDwhQsKzKKnF',
//             collection: {
//                 name: 'SigVerify Document Collection',
//                 family: encrypted ? 'encrypted_document' : 'document',
//             },
//             encrypted: encrypted,
//             author: author,
//             requiredSignersWallets: requiredSignersWallets.join(', '),
//             document: {
//                 originalFileName,
//                 originalFileFormat,
//                 originalFileSize,
//                 originalFileHash: base64EncodedSha512HashOfOriginalFileArrayBuffer,
//                 metadata,
//                 data,
//             },
//         };

//         const ipfsResponse = await pinata.pinJSONToIPFS(documentMetadata);
//         const ipfsHash = ipfsResponse.IpfsHash;

//         const newDocumentId = await DocumentsModel.storeNewDocument(req.user.userId, {
//             title: metadata.title,
//             description: metadata.description,
//             category: metadata.category,
//             encrypted,
//             documentName: originalFileName,
//             documentType: originalFileFormat,
//             documentSize: originalFileSize,
//             requiredSignersWallets,
//             allInvolvedHashedEmails: allInvolvedEmailsArray,
//             ipfsHash,
//         });

//         res.status(200).json({
//             message: 'Document stored and recorded successfully',
//             documentId: newDocumentId,
//             ipfsHash: ipfsHash,
//         });
//     } catch (error) {
//         console.error('Error in storeNewDocumentDataToIpfs:', error);
//         res.status(500).send('Error processing request');
//     }
// };

// const addDocumentSignature = async (req, res) => {
//     const { docId, xrplTxHash } = req.body;

//     try {
//         const newSignatureId = await DocumentsModel.addDocumentSignature(docId, req.user.userId, xrplTxHash);
//         res.status(200).json({
//             message: 'Signature stored and recorded successfully',
//             newSignatureId,
//         });
//     } catch (error) {
//         console.error('Error in addDocumentSignature:', error);
//         res.status(500).send('Error processing request');
//     }
// };

// const getAllUserDocumentsWithSignatureStatus = async (req, res) => {
//     try {
//         const hashedEmail = await hashStringUsingSha256(req.user.email);
//         const documents = await DocumentsModel.getAllUserDocumentsWithSignatureStatus(req.user.userId, hashedEmail);
//         res.json(documents);
//     } catch (error) {
//         console.error('Error fetching documents with signature status:', error);
//         res.status(500).send('Internal Server Error');
//     }
// };

// const hasUserSignedDocument = async (req, res) => {
//     const { docId } = req.query; // Assuming docId is passed as a query parameter

//     try {
//         const hasSigned = await DocumentsModel.hasUserSignedDocument(docId, req.user.userId);
//         res.json({ hasSigned });
//     } catch (error) {
//         console.error('Error checking document signature:', error);
//         res.status(500).send('Error processing request');
//     }
// };

// export {
//     storeNewDocumentDataToIpfsAndDatabase,
//     addDocumentSignature,
//     getAllUserDocumentsWithSignatureStatus,
//     hasUserSignedDocument,
// };