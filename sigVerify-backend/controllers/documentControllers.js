import pool from '../config/db.js';
import { returnSignedUrlFromS3BucketKey } from '../config/s3Bucket.js';

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
    return result.rows.map((row) => ({
        document_id: row.id,
        title: row.title,
        description: row.description,
        category: row.category,
        name: row.document_name,
        type: row.document_type,
        size: row.document_size,
        key: row.document_s3_key,
        signed: row.signed,
        xrplTxHash: row.xrpl_tx_hash,
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
const getAllUserDocuments = async (req, res) => {
    const userAuthId = req.user.userId;
    let client;

    try {
        client = await pool.connect();

        // Retrieve all document keys for the user
        const documentsArray = await getAllDocPropsByUserAuthId(client, userAuthId);

        if (documentsArray.length === 0) {
            return res.status(200).json({ message: 'No documents found for this user' });
        }

        console.log(documentsArray);

        const documentsPromises = documentsArray.map((doc) => {
            return returnSignedUrlFromS3BucketKey(doc.key).then((signedUrl) => {
                return { ...doc, signedUrl };
            });
        });

        // retrieve array of all users document in for of signedURL
        // const arrayOfUsersSignedDocumentUrls =  await retrieveS3BucketObjects(documentKeysAndDocumentNames);
        const documentsArrayWithSignedUrlField = await Promise.all(documentsPromises);

        console.log('documentsArrayWithSignedUrlField: ', documentsArrayWithSignedUrlField);

        res.status(200).json(documentsArrayWithSignedUrlField);
    } catch (error) {
        console.error('Error in getUserDocuments:', error);
        res.status(500).send('Error retrieving documents');
    } finally {
        if (client) {
            client.release();
        }
    }
};

export { uploadFiles, getAllUserDocuments };
