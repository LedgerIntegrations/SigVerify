import pool from '../config/db.js';
import { returnSignedUrlFromS3BucketKey } from '../config/s3Bucket.js';
import { nftStorageClient, File } from '../config/nftStorageClient.js';
import { pinata } from '../config/pinataConnect.js';

// query database for users linked user_meta_id by email table
const getUserMetaId = async (client, userAuthId) => {
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

// insert single document into database, linked to given user_meta_id
const insertDocumentDetails = async (client, userMetaId, file, customFormData) => {
    const documentInsertQuery = `
        INSERT INTO documents
        (user_meta_id, title, description, category, document_name, document_type, document_size, document_s3_key)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`;

    await client.query(documentInsertQuery, [
        userMetaId,
        customFormData.title,
        customFormData.description,
        customFormData.category,
        file.originalname,
        file.mimetype,
        file.size,
        file.key,
    ]);
};

// query database for users linked document keys and names by email address
const getAllDocPropsByUserAuthId = async (client, userAuthId) => {
    const query = `
        SELECT
            documents.*,
            (CASE WHEN signatures.id IS NOT NULL THEN TRUE ELSE FALSE END) AS signed,
            signatures.xrpl_tx_hash,
            documents.expires_at AS expires,
            documents.created_at AS uploaded
        FROM
            documents
        JOIN
            user_meta ON documents.user_meta_id = user_meta.id
        LEFT JOIN
            signatures ON documents.id = signatures.document_id
        WHERE
            user_meta.user_auth_id = $1;
    `;

    const result = await client.query(query, [userAuthId]);

    // Instead of throwing an error, return an empty array if no documents are found
    if (result.rows.length === 0) {
        return [];
    }

    // return result.rows.map(row => ({ document_key: row.document_s3_key, document_name: row.document_name }));
    // return result.rows.map((row) => ({
    //     document_id: row.id,
    //     title: row.title,
    //     description: row.description,
    //     category: row.category,
    //     name: row.document_name,
    //     type: row.document_type,
    //     size: row.document_size,
    //     key: row.document_s3_key,
    //     signed: row.signed,
    //     xrplTxHash: row.xrpl_tx_hash,
    //     expires: row.expires === null ? false : row.expires,
    //     uploaded: row.uploaded,
    // }));

    return result.rows.map((row) => ({
        document_id: row.id,
        title: row.title,
        description: row.description,
        category: row.category,
        type: row.document_type,
        size: row.document_size,
        signed: row.signed,
        ipfs_hash: row.ipfs_hash,
        expires: row.expires === null ? false : row.expires,
        uploaded: row.uploaded,
    }));
};

const uploadFiles = async (req, res) => {
    const userId = req.user.userId;
    const files = req.files;
    const customFormData = JSON.parse(req.body.customFormData);

    console.log('document controllers files log: ', files);
    console.log('custom form data: ', customFormData);

    if (!files || files.length === 0) {
        return res.status(400).json({ error: 'No files provided' });
    }

    let client;
    try {
        client = await pool.connect();
        await client.query('BEGIN');
        const userMetaId = await getUserMetaId(client, userId);

        for (const file of files) {
            await insertDocumentDetails(client, userMetaId, file, customFormData);
        }

        await client.query('COMMIT');
        res.status(200).json({ message: 'Files uploaded successfully' });
    } catch (error) {
        console.error('Error while uploading files:', error.message);
        await client.query('ROLLBACK');
        res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        if (client) {
            client.release();
        }
    }
};

// given email, return all users documents
// !DEPRECATED: removed while not using AWS S3 for document storage currently --> now using ipfs document storage
// const getAllUserDocuments = async (req, res) => {
//     const userAuthId = req.user.userId;
//     let client;

//     try {
//         client = await pool.connect();

//         // Retrieve all document keys for the user
//         const documentsArray = await getAllDocPropsByUserAuthId(client, userAuthId);

//         if (documentsArray.length === 0) {
//             return res.status(200).json({ message: 'No documents found for this user' });
//         }

//         console.log(documentsArray);

//         const documentsPromises = documentsArray.map((doc) => {
//             return returnSignedUrlFromS3BucketKey(doc.key).then((signedUrl) => {
//                 return { ...doc, signedUrl };
//             });
//         });

//         // retrieve array of all users document in for of signedURL
//         // const arrayOfUsersSignedDocumentUrls =  await retrieveS3BucketObjects(documentKeysAndDocumentNames);
//         const documentsArrayWithSignedUrlField = await Promise.all(documentsPromises);

//         console.log('documentsArrayWithSignedUrlField: ', documentsArrayWithSignedUrlField);

//         res.status(200).json(documentsArrayWithSignedUrlField);
//     } catch (error) {
//         console.error('Error in getUserDocuments:', error);
//         res.status(500).send('Error retrieving documents');
//     } finally {
//         if (client) {
//             client.release();
//         }
//     }
// };

const getAllUserDocuments = async (req, res) => {
    let client;

    try {
        const userAuthId = req.user.userId;

        // First, get the user_meta_id corresponding to the logged-in user's auth ID
        client = await pool.connect();
        await client.query('BEGIN');
        const userMetaId = await getUserMetaId(client, userAuthId);

        // Query to fetch documents
        const documentsQuery = `
            SELECT d.*,
                   CASE
                       WHEN d.user_meta_id = $1 THEN 'sender'
                       ELSE 'recipient'
                   END as role,
                   EXISTS(SELECT 1 FROM signatures WHERE document_id = d.id) as is_signed
            FROM documents d
            WHERE d.user_meta_id = $1 OR $2 = ANY(d.all_recipients);
        `;

        const documents = await pool.query(documentsQuery, [userMetaId, req.user.email]);

        res.json(documents.rows);
    } catch (error) {
        console.error('Error fetching documents:', error);
        res.status(500).send('Internal Server Error');
    }
};

//NEW CONTROLLERS FOR ENCRYPTED DOCUMENT DATA USING PROPER SCHEMAS
const storeEncryptedDocumentDataToIpfs = async (req, res) => {
    let client;

    try {
        client = await pool.connect(); // Connect to the database
        await client.query('BEGIN'); // Start a new transaction

        const {
            encrypted_data,
            encrypted_aes_key,
            iv_base64,
            encrypted_data_format,
            encryption_algorithm,
            encryption_aes_key_length,
            encryption_aes_key_hash,
            original_file_name,
            original_file_format,
            original_file_size,
            original_file_hash,
            required_signers, // Make sure this is provided in the request
            encrypted, // Flag indicating if the data is encrypted
            metadata,
        } = req.body;

        // Validate data according to your schema here...

        const baseMetaDataSchemaInfo = {
            schema: 'ipfs://QmXFJiC95vqKXoAFCTnJ6iKtz1wmUwNbTkYTKroEV9yfb9',
            nftType: 'encrypted_document.v0',
            name: 'SigVerify Decentralized Document',
            description: 'Standardized JSON format for storing of encrypted document data on IPFS.',
        };

        const documentMetadata = {
            encrypted_data: encrypted_data,
            encrypted_aes_key: encrypted_aes_key,
            iv_base64: iv_base64,
            encrypted_data_format: encrypted_data_format,
            encryption_algorithm: encryption_algorithm,
            encryption_aes_key_length: encryption_aes_key_length,
            encryption_aes_key_hash: encryption_aes_key_hash,
            original_file_name: original_file_name,
            original_file_format: original_file_format,
            original_file_size: original_file_size,
            original_file_hash: original_file_hash,
            required_signers: required_signers,
            encrypted: encrypted,
            metadata: metadata,
        };

        console.log('document data on server: ', documentMetadata);

        // Type and format validation
        const errors = [];
        if (typeof encrypted_data !== 'string') errors.push({ field: 'encrypted_data', expectedType: 'string' });
        if (typeof encrypted_aes_key !== 'string') errors.push({ field: 'encrypted_aes_key', expectedType: 'string' });
        if (typeof iv_base64 !== 'string') errors.push({ field: 'iv_base64', expectedType: 'string' });
        if (encrypted_data_format !== 'base64')
            errors.push({ field: 'encrypted_data_format', expectedValue: 'base64' });
        if (encryption_algorithm !== 'AES-GCM')
            errors.push({ field: 'encryption_algorithm', expectedValue: 'AES-GCM' });
        if (typeof encryption_aes_key_length !== 'number')
            errors.push({ field: 'encryption_aes_key_length', expectedType: 'number' });
        if (typeof encryption_aes_key_hash !== 'string')
            errors.push({ field: 'encryption_aes_key_hash', expectedType: 'string' });
        if (typeof original_file_name !== 'string')
            errors.push({ field: 'original_file_name', expectedType: 'string' });
        if (typeof original_file_format !== 'string')
            errors.push({ field: 'original_file_format', expectedType: 'string' });
        if (typeof original_file_size !== 'number')
            errors.push({ field: 'original_file_size', expectedType: 'number' });
        if (typeof original_file_hash !== 'string')
            errors.push({ field: 'original_file_hash', expectedType: 'string' });
        if (!Array.isArray(required_signers)) errors.push({ field: 'required_signers', expectedType: 'array' });
        if (typeof encrypted !== 'boolean') errors.push({ field: 'encrypted', expectedType: 'boolean' });
        if (typeof metadata !== 'object') errors.push({ field: 'metadata', expectedType: 'object' });

        if (errors.length > 0) {
            return res.status(400).json({ error: 'Invalid data format or type', details: errors });
        }

        const pinataResponse = await pinata.pinJSONToIPFS(documentMetadata);
        console.log('pinate response: ', pinataResponse);
        // Extract the necessary metadata for documents table
        const { title, description, author, recipient_email, all_recipients, category } = metadata;

        // Insert the new document into the database
        const documentInsertQuery = `
            INSERT INTO documents
            (user_meta_id, title, description, category, document_name, document_type, document_size, recipient_email, all_recipients, ipfs_hash)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING id;`;

        const userMetaId = await getUserMetaId(client, req.user.userId); // Retrieve user_meta_id using a function

        const documentResult = await client.query(documentInsertQuery, [
            userMetaId,
            title,
            description,
            category,
            original_file_name,
            original_file_format,
            original_file_size,
            recipient_email,
            all_recipients,
            pinataResponse.IpfsHash,
        ]);

        // Get the newly created document ID
        const newDocumentId = documentResult.rows[0].id;

        await client.query('COMMIT'); // Commit the transaction

        res.status(200).json({
            message: 'Document stored and recorded successfully',
            documentId: newDocumentId,
            ipfsHash: pinataResponse.IpfsHash,
        });
    } catch (error) {
        if (client) {
            await client.query('ROLLBACK'); // Rollback the transaction on error
        }
        console.error('Error in storeEncryptedDocumentDataToIpfs:', error);
        res.status(500).send('Error processing request');
    } finally {
        if (client) {
            client.release(); // Release the client back to the pool
        }
    }
};

// const storeDocumentDataToIpfsInNftAttributeFormat = async (req, res) => {
//     let client;

//     try {
//         client = await pool.connect(); // Connect to the database
//         await client.query('BEGIN'); // Start a new transaction

//         // Extract data from request body
//         const {
//             original_file_name,
//             original_file_format,
//             original_file_size,
//             original_file_hash,
//             required_signers,
//             encrypted,
//             metadata,
//         } = req.body;

//         let documentMetadata = {
//             schema: 'ipfs://QmNpi8rcXEkohca8iXu7zysKKSJYqCvBJn3xJwga8jXqWU',
//             nftType: encrypted ? 'encrypted_document.v0' : 'document.v0',
//             name: metadata.title || 'Untitled Document',
//             description: metadata.description || 'No description provided',
//             image: 'ipfs://QmcqQ4W2pFFuQg5jcdzBXE9Jm566yCgX43dDwhQsKzKKnF', // Replace with actual image path
//             collection: {
//                 name: 'SigVerify Document Collection',
//                 family: 'SigVerify',
//             },
//             attributes: [
//                 {
//                     trait_type: 'original_file_name',
//                     value: original_file_name,
//                     description: 'Original name of the file',
//                 },
//                 {
//                     trait_type: 'original_file_format',
//                     value: original_file_format,
//                     description: 'Format of the original file',
//                 },
//                 {
//                     trait_type: 'original_file_size',
//                     value: original_file_size,
//                     description: 'Size of the original file in bytes',
//                 },
//                 {
//                     trait_type: 'original_file_hash',
//                     value: original_file_hash,
//                     description: 'Hash of the original file for integrity check',
//                 },
//                 {
//                     trait_type: 'required_signers',
//                     value: required_signers.join(', '),
//                     description: 'List of sha256 email hashes required to sign the document',
//                 },
//             ],
//         };

//         if (encrypted) {
//             const {
//                 encrypted_data,
//                 encrypted_aes_key,
//                 iv_base64,
//                 encrypted_data_format,
//                 encryption_algorithm,
//                 encryption_aes_key_length,
//                 encryption_aes_key_hash,
//             } = req.body.encryptionProperties;

//             documentMetadata.attributes.push(
//                 {
//                     trait_type: 'encrypted_data',
//                     value: encrypted_data,
//                     description: 'AES-GCM Encrypted data of the document encoded in base64',
//                 },
//                 {
//                     trait_type: 'encrypted_aes_key',
//                     value: encrypted_aes_key,
//                     description: 'RSA-OAEP Encrypted AES key encoded in base64',
//                 },
//                 { trait_type: 'iv_base64', value: iv_base64, description: 'Initialization vector in Base64 format' },
//                 {
//                     trait_type: 'encrypted_data_format',
//                     value: encrypted_data_format,
//                     description: 'Format of the encrypted data attribute.',
//                 },
//                 {
//                     trait_type: 'encryption_algorithm',
//                     value: encryption_algorithm,
//                     description: 'Algorithm used for encryption of raw document data.',
//                 },
//                 {
//                     trait_type: 'encryption_aes_key_length',
//                     value: encryption_aes_key_length,
//                     description: 'Length of the AES encryption key in bits',
//                 },
//                 {
//                     trait_type: 'encryption_aes_key_hash',
//                     value: encryption_aes_key_hash,
//                     description: 'Sha-512 hash of the raw exported AES encryption key. Used for key authentication.',
//                 }
//             );
//         } else {
//             const { unencrypted_data, unencrypted_data_format } = req.body.rawProperties;

//             documentMetadata.attributes.push(
//                 {
//                     trait_type: 'unencrypted_data',
//                     value: unencrypted_data,
//                     description: 'Unencrypted data of the document',
//                 },
//                 {
//                     trait_type: 'unencrypted_data_format',
//                     value: unencrypted_data_format,
//                     description: 'Format of the unencrypted data',
//                 }
//             );
//         }

//         console.log('Document metadata on server: ', documentMetadata);

//         // // Perform type and format validation here...

//         // const pinataResponse = await pinata.pinJSONToIPFS(documentMetadata);
//         // console.log('Pinata response: ', pinataResponse);

//         // const { title, description, author, recipient_email, all_recipients, category } = metadata;

//         // const documentInsertQuery = `
//         //     INSERT INTO documents
//         //     (user_meta_id, title, description, category, document_name, document_type, document_size, recipient_email, all_recipients, ipfs_hash)
//         //     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
//         //     RETURNING id;`;

//         // const userMetaId = await getUserMetaId(client, req.user.userId);

//         // const documentResult = await client.query(documentInsertQuery, [
//         //     userMetaId,
//         //     title,
//         //     description,
//         //     category,
//         //     original_file_name,
//         //     original_file_format,
//         //     original_file_size,
//         //     recipient_email,
//         //     all_recipients,
//         //     pinataResponse.IpfsHash,
//         // ]);

//         // const newDocumentId = documentResult.rows[0].id;

//         // await client.query('COMMIT');

//         res.status(200).json({
//             message: 'Document stored and recorded successfully',
//             // documentId: newDocumentId,
//             // ipfsHash: pinataResponse.IpfsHash,
//         });
//     } catch (error) {
//         if (client) {
//             await client.query('ROLLBACK');
//         }
//         console.error('Error in storeDocumentDataToIpfs:', error);
//         res.status(500).send('Error processing request');
//     } finally {
//         if (client) {
//             client.release();
//         }
//     }
// };

const storeDocumentDataToIpfs = async (req, res) => {
    const { userId } = req.user;
    let client;

    try {
        client = await pool.connect();
        await client.query('BEGIN');

        // Extract data from request body
        const {
            original_file_name,
            original_file_format,
            original_file_size,
            original_file_hash,
            required_signers_wallets,
            recipient_signer_wallet,
            metadata,
            encrypted,
            encryptionProperties,
            rawProperties,
        } = req.body;

        // Construct the metadata object based on encrypted or unencrypted schema
        let documentData = {
            originalFileName: original_file_name,
            originalFileFormat: original_file_format,
            originalFileSize: original_file_size,
            originalFileHash: original_file_hash,
            metaData: {
                category: metadata.category,
                creationDate: metadata.creation_date,
                recipient: metadata.receiver,
                allRecipients: metadata.all_recipients.join(', '),
            },
        };

        if (encrypted) {
            // Add encrypted document specific properties
            documentData = {
                ...documentData,
                ...encryptionProperties,
            };
        } else {
            // Add unencrypted document specific properties
            documentData = {
                ...documentData,
                ...rawProperties,
            };
        }

        let documentMetadata = {
            schema: encrypted
                ? 'ipfs://QmSeNw7zRZqgK5rdVFGG1cDC6NGFJeag6ZxWVP1Q7m21CK'
                : 'ipfs://QmWKUxCSvqdQPBqJBXcRqrit5nXgFJoCDGkdqpjRuFAknn',
            nftType: encrypted ? 'encrypted_document.v0' : 'document.v0',
            name: metadata.title || 'Untitled Document',
            description: metadata.description || 'No description provided',
            image: 'ipfs://QmcqQ4W2pFFuQg5jcdzBXE9Jm566yCgX43dDwhQsKzKKnF',
            collection: {
                name: 'SigVerify Document Collection',
                family: 'SigVerify',
            },
            encrypted: encrypted,
            author: metadata.author,
            receiver: recipient_signer_wallet,
            requiredSigners: required_signers_wallets.join(', '),
            document: documentData,
        };

        console.log('Document metadata on server: ', documentMetadata);

        // Perform type and format validation here...

        // Pin the document metadata to IPFS
        // const ipfsResponse = await pinata.pinJSONToIPFS(documentMetadata);
        // const ipfsHash = ipfsResponse.IpfsHash;
        // console.log('Pinned to IPFS with hash:', ipfsHash);

        // store do database

        res.status(200).json({
            documentMetadata
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

export { uploadFiles, getAllUserDocuments, storeEncryptedDocumentDataToIpfs, storeDocumentDataToIpfs };
