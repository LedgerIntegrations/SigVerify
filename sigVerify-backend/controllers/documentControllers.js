const pool = require('../config/db');
const { returnSignedUrlFromS3BucketKey } = require('../config/s3Bucket');

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
const insertDocumentDetails = async (client, userMetaId, file) => {
    const documentInsertQuery =
        'INSERT INTO documents (user_meta_id, document_name, document_type, document_size, document_s3_key) VALUES ($1, $2, $3, $4, $5)';
    await client.query(documentInsertQuery, [userMetaId, file.originalname, file.mimetype, file.size, file.key]);
};

// query database for users linked document keys and names by email address
const getAllDocPropsByEmail = async (client, userAuthId) => {
    // const query = `
    // SELECT
    // documents.*,
    // (CASE WHEN signatures.id IS NOT NULL THEN TRUE ELSE FALSE END) AS signed,
    // signatures.xrpl_tx_hash,
    // documents.expires_at AS expires,
    // documents.created_at AS uploaded
    // FROM
    //     documents
    // JOIN
    //     user_meta ON documents.user_meta_id = user_meta.id
    // JOIN
    //     user_email ON user_meta.id = user_email.user_meta_id
    // LEFT JOIN
    //     signatures ON documents.id = signatures.document_id
    // WHERE
    //     user_email.email = $1
    // `;

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

exports.uploadFiles = async (req, res) => {
    const userEmail = req.body.userEmail;
    const files = req.files;

    console.log('document controllers files log: ', files);

    if (!files || files.length === 0) {
        return res.status(400).json({ error: 'No files provided' });
    }

    let client;
    try {
        client = await pool.connect();
        await client.query('BEGIN');
        const userMetaId = await getUserMetaId(client, userEmail);

        for (const file of files) {
            await insertDocumentDetails(client, userMetaId, file);
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
exports.getAllUsersDocumentsGivenTheirUserAuthId = async (req, res) => {
    console.log('request user after auth middleware: ', req.user);
    const userAuthId = req.body.userAuthId;
    let client;

    try {
        client = await pool.connect();

        // Retrieve all document keys for the user
        const documentsArray = await getAllDocPropsByEmail(client, userAuthId);

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
