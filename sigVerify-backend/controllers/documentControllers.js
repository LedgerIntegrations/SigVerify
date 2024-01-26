// SigVerify/sigVerify-backend/controllers/documentControllers.js

import pool from '../config/db.js';
import { returnSignedUrlFromS3BucketKey } from '../config/s3Bucket.js';
import { pinata } from '../config/pinataConnect.js';
import crypto from 'crypto';

//* helper function: returns crypto module sha256 hash of given string (used for email)
async function hashStringUsingSha256(string) {
    return crypto.createHash('sha256').update(string).digest('hex');
}

//* Helper function: given user_auth table id returns user_meta table id
const convertUserAuthIdToUserMetaId = async (client, userAuthId) => {
    const userMetaQuery = `
        SELECT
            user_meta.id
        FROM
            user_meta
        WHERE
            user_meta.user_auth_id = $1;
    `;
    const userMetaResult = await client.query(userMetaQuery, [userAuthId]);
    if (userMetaResult.rows.length === 0) {
        throw new Error('User not found');
    }
    return userMetaResult.rows[0].id;
};

const storeNewDocumentDataToIpfsAndDatabase = async (req, res) => {
    const { userId } = req.user;
    let client;

    try {
        client = await pool.connect();
        await client.query('BEGIN');

        // Extract data from request body
        const {
            originalFileName,
            originalFileFormat,
            originalFileSize,
            base64EncodedSha512HashOfOriginalFileArrayBuffer,
            requiredSignersWallets,
            author,
            metadata,
            encrypted,
            data,
        } = req.body;

        let allInvolvedEmailsArray;

        if (encrypted) {
            // Extract keys (hashed emails) from the hash table
            allInvolvedEmailsArray = Object.keys(data.accessControls);
        } else {
            // When unencrypted, accessControls is already an array of hashed emails
            allInvolvedEmailsArray = data.accessControls;
        }

        // Construct the metadata object based on encrypted or unencrypted schema
        let documentData = {
            originalFileName,
            originalFileFormat,
            originalFileSize,
            originalFileHash: base64EncodedSha512HashOfOriginalFileArrayBuffer,
            metadata,
            data,
        };

      //? change required signers wallets from string to array type in schema
      //? required_signers_wallets stored in db as array, but in schema as string
        let documentMetadata = {
            schema: encrypted
                ? 'ipfs://Qma6Tnpzycw36LhFarF8gEwFRWrLSxmosi27S6Mh8zSBxn'
                : 'ipfs://QmZytGcRCzrDVTnMrfD1xbznz38HtiyoSCPLwRvGqY5Mty',
            nftType: encrypted ? 'encrypted_document.v0' : 'document.v0',
            name: metadata.title || 'Untitled Document',
            description: metadata.description || 'No description provided',
            image: 'ipfs://QmcqQ4W2pFFuQg5jcdzBXE9Jm566yCgX43dDwhQsKzKKnF',
            collection: {
                name: 'SigVerify Document Collection',
                family: encrypted ? 'encrypted_document' : 'document',
            },
            encrypted: encrypted,
            author: author,
            requiredSignersWallets: requiredSignersWallets.join(', '),
            document: documentData,
        };

        console.log('Document metadata on server: ', documentMetadata);

        // Perform type and format validation here...

        // Pin the document metadata to IPFS
        //TODO: decouple encrypted document data from the root document ipfs cid, making a pointer to the second document data cid
        const ipfsResponse = await pinata.pinJSONToIPFS(documentMetadata);
        const ipfsHash = ipfsResponse.IpfsHash;
        console.log('Pinned to IPFS with hash:', ipfsHash);

        // Insert the new document into the database
        const documentInsertQuery = `
          INSERT INTO documents
          (user_meta_id, title, description, category, encrypted, document_name, document_type, document_size, required_signers_wallets, all_involved_hashed_emails, ipfs_hash)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
          RETURNING id;
      `;

        const userMetaId = await convertUserAuthIdToUserMetaId(client, req.user.userId); // Retrieve user_meta_id using a function

        const documentResult = await client.query(documentInsertQuery, [
            userMetaId, // $1
            metadata.title, // $2
            metadata.description, // $3
            metadata.category, // $4
            encrypted, // $5
            originalFileName, // $6
            originalFileFormat, // $7
            originalFileSize, // $8
            requiredSignersWallets, // $9
            allInvolvedEmailsArray, // $10
            ipfsHash, // $11
        ]);

        // Get the newly created document ID
        const newDocumentId = documentResult.rows[0].id;

        await client.query('COMMIT'); // Commit the transaction

        res.status(200).json({
            message: 'Document stored and recorded successfully',
            documentId: newDocumentId,
            ipfsHash: ipfsHash,
        });
    } catch (error) {
        if (client) {
            await client.query('ROLLBACK');
        }
        console.error('Error in storeDocumentDataToIpfs:', error);
        res.status(500).send('Error processing request');
    } finally {
        if (client) {
            client.release();
        }
    }
};

const addDocumentSignature = async (req, res) => {
    const { userId } = req.user;
    const { docId, xrplTxHash } = req.body;

    let client;

    try {
        client = await pool.connect();
        await client.query('BEGIN');

        // Get user_meta_id and verified_xrpl_wallet_address
        const userMetaQuery = `
            SELECT id, verified_xrpl_wallet_address
            FROM user_meta
            WHERE user_auth_id = $1;
        `;
        const userMetaResult = await client.query(userMetaQuery, [userId]);
        if (userMetaResult.rows.length === 0) {
            throw new Error('User not found');
        }
        const { id: userMetaId, verified_xrpl_wallet_address: userWallet } = userMetaResult.rows[0];

        // Check if user's wallet is in the document's required_signers_wallets
        const documentQuery = `
            SELECT required_signers_wallets
            FROM documents
            WHERE id = $1;
        `;
        const documentResult = await client.query(documentQuery, [docId]);
        if (documentResult.rows.length === 0) {
            throw new Error('Document not found');
        }
        const requiredWallets = documentResult.rows[0].required_signers_wallets;
        if (!requiredWallets.includes(userWallet)) {
            throw new Error('User is not a required signer for this document');
        }

        // Insert the new signature into the database
        const signatureInsertQuery = `
            INSERT INTO signatures (document_id, user_id, xrpl_tx_hash)
            VALUES ($1, $2, $3)
            RETURNING id;
        `;
        const signatureResult = await client.query(signatureInsertQuery, [docId, userMetaId, xrplTxHash]);
        const newSignatureId = signatureResult.rows[0].id;

        await client.query('COMMIT'); // Commit the transaction

        res.status(200).json({
            message: 'Signature stored and recorded successfully',
            newSignatureId,
        });
    } catch (error) {
        if (client) {
            await client.query('ROLLBACK');
        }
        console.error('Error in addDocumentSignature:', error);
        res.status(500).send('Error processing request');
    } finally {
        if (client) {
            client.release();
        }
    }
};

const getAllUserDocumentsWithSignatureStatus = async (req, res) => {
    let client;

    try {
        const userAuthId = req.user.userId;

        client = await pool.connect();
        await client.query('BEGIN');

        // Get the user_meta_id
        const userMetaId = await convertUserAuthIdToUserMetaId(client, userAuthId);
        const hashedEmail = await hashStringUsingSha256(req.user.email);

        // Query to fetch documents and signature status
        const documentsQuery = `
            SELECT d.*,
                  CASE
                      WHEN d.user_meta_id = $1 THEN 'sender'
                      ELSE 'recipient'
                  END as role,
                  EXISTS(SELECT 1 FROM signatures WHERE document_id = d.id) as is_signed,
                  ARRAY(
                      SELECT unnest(d.required_signers_wallets) EXCEPT
                      SELECT um.verified_xrpl_wallet_address FROM signatures s
                      JOIN user_meta um ON s.user_id = um.id
                      WHERE s.document_id = d.id
                  ) as missing_signatures,
                  ARRAY(
                      SELECT s.xrpl_tx_hash FROM signatures s
                      WHERE s.document_id = d.id
                  ) as xrpl_tx_hashes
            FROM documents d
            WHERE d.user_meta_id = $1
                  OR $2 = ANY(d.all_involved_hashed_emails);
        `;

        const documentsResult = await client.query(documentsQuery, [userMetaId, hashedEmail]);
        await client.query('COMMIT'); // Commit the transaction

        res.json(documentsResult.rows);
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error fetching documents with signature status:', error);
        res.status(500).send('Internal Server Error');
    } finally {
        if (client) {
            client.release();
        }
    }
};


const hasUserSignedDocument = async (docId) => {
    const { userId } = req.user;
    let client;
    try {
        client = await pool.connect();
        await client.query('BEGIN');

        const query = `
            SELECT EXISTS (
                SELECT 1
                FROM signatures
                WHERE document_id = $1 AND user_id = $2
            ) as has_signed;
        `;

        const result = await client.query(query, [docId, userId]);
        await client.query('COMMIT'); // Successfully end the transaction
        return result.rows[0].has_signed;
    } catch (error) {
        if (client) {
            await client.query('ROLLBACK'); // Roll back transaction in case of an error
        }
        console.error('Error checking document signature:', error);
        throw error;
    } finally {
        if (client) {
            client.release(); // release the client back to the pool
        }
    }
};

export {
    storeNewDocumentDataToIpfsAndDatabase,
    addDocumentSignature,
    getAllUserDocumentsWithSignatureStatus,
    hasUserSignedDocument,
};
