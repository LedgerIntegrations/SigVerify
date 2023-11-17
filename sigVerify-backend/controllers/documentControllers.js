const pool = require('../config/db');
const { retrieveS3BucketObjects } = require('../config/s3Bucket')

// query database for users linked user_meta_id by email table
const getUserMetaId = async (client, userEmail) => {
    const userMetaQuery = 'SELECT user_meta.id FROM user_meta JOIN user_email ON user_meta.id = user_email.user_meta_id WHERE user_email.email = $1';
    const userMetaResult = await client.query(userMetaQuery, [userEmail]);
    if (userMetaResult.rows.length === 0) {
        throw new Error('User not found');
    }
    return userMetaResult.rows[0].id;
};

// insert single document into database, linked to given user_meta_id
const insertDocumentDetails = async (client, userMetaId, file) => {
    const documentInsertQuery = 'INSERT INTO documents (user_meta_id, document_name, document_type, document_size, document_key) VALUES ($1, $2, $3, $4, $5)';
    await client.query(documentInsertQuery, [userMetaId, file.originalname, file.mimetype, file.size, file.key]);
};

// query database for users linked document keys and names by email address
const getDocumentKeysAndDocumentNames = async (client, userEmail) => {
    const query = `
        SELECT documents.document_key, documents.document_name
        FROM documents
        JOIN user_meta ON documents.user_meta_id = user_meta.id
        JOIN user_email ON user_meta.id = user_email.user_meta_id
        WHERE user_email.email = $1;
    `;

    const result = await client.query(query, [userEmail]);
    if (result.rows.length === 0) {
        throw new Error('No documents found for this email');
    }

    return result.rows.map(row => ({ document_key: row.document_key, document_name: row.document_name }));
};

exports.uploadFiles = async (req, res) => {
    const userEmail = req.body.userEmail;
    const files = req.files;

    console.log("document controllers files log: ", files);

    if (!files || files.length === 0) {
        return res.status(400).json({ error: 'No files provided' });
    };

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
        console.error("Error while uploading files:", error.message);
        await client.query('ROLLBACK');
        res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        if (client) {
            client.release();
        }
    }
};

exports.getAllUsersDocumentsGivenTheirEmail = async (req, res) => {
    const userEmail = req.body.email;
    let client;

    try {
        client = await pool.connect();

        // Retrieve all document keys for the user
        const documentKeysAndDocumentNames = await getDocumentKeysAndDocumentNames(client, userEmail);
        
        // retrieve array of all users document in for of signedURL
        const arrayOfUsersSignedDocumentUrls =  await retrieveS3BucketObjects(documentKeysAndDocumentNames);

        res.status(200).json(arrayOfUsersSignedDocumentUrls);
    } catch (error) {
        console.error('Error in getUserDocuments:', error);
        res.status(500).send('Error retrieving documents');
    } finally {
        if (client) {
            client.release();
        }
    }
};



