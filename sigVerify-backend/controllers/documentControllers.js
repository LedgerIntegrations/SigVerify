const pool = require('../config/db');
const { createFileObject, generatePresignedUrl, retrieveS3BucketObject } = require('../config/s3Bucket')




exports.uploadFiles = async (req, res) => {
    console.log("upload file route hit.");

    const userEmail = req.body.userEmail;
    const files = req.files;

    console.log(files);
    
    let client;

    try {
        client = await pool.connect();
        await client.query('BEGIN');

        // Retrieve user_meta_id based on userEmail
        const userMetaQuery = 'SELECT user_meta.id FROM user_meta JOIN user_email ON user_meta.id = user_email.user_meta_id WHERE user_email.email = $1';
        const userMetaResult = await client.query(userMetaQuery, [userEmail]);
        if (userMetaResult.rows.length === 0) {
            throw new Error('User not found');
        }
        const userMetaId = userMetaResult.rows[0].id;

        // Process file uploads
        const uploadPromises = files.map(file => createFileObject(file));
        const uploadResults = await Promise.all(uploadPromises);

        // Insert new document details into the database
        const documentInsertQuery = 'INSERT INTO documents (user_meta_id, document_name, document_type, document_size, document_key) VALUES ($1, $2, $3, $4, $5)';
        for (const upload of uploadResults) {
            await client.query(documentInsertQuery, [userMetaId, upload.file.originalname, upload.file.mimetype, upload.file.size, upload.documentKey]);
        }

        await client.query('COMMIT');
        res.status(200).json({ message: 'Files uploaded successfully' });
    } catch (error) {
        console.error("Error while uploading files:", error);
        await client.query('ROLLBACK');
        res.status(500).json({ error: "Internal Server Error" });
    } finally {
        client.release();
    }
};

exports.getDocumentKeysByEmailAndReturnDocuments = async (req, res) => {
    const userEmail = req.body.email; // Assuming email is passed as a URL parameter

    let client;

    try {
        client = await pool.connect();
        await client.query('BEGIN');

        // Query to join user_email, user_meta, and documents tables to get document keys
        const query = `
            SELECT documents.document_key
            FROM documents
            JOIN user_meta ON documents.user_meta_id = user_meta.id
            JOIN user_email ON user_meta.id = user_email.user_meta_id
            WHERE user_email.email = $1;
        `;

        const result = await client.query(query, [userEmail]);

        // Check if any documents are found
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'No documents found for this email' });
        }

        // Extracting document keys
        const documentKeys = result.rows.map(row => row.document_key);

        const arrayOfDocumentPromises = documentKeys.map(key => generatePresignedUrl(key));
        const arrayOfDocuments = await Promise.all(arrayOfDocumentPromises);
        console.log("arrayOfDocuments: ", arrayOfDocuments);
        res.status(200).json({ documents: arrayOfDocuments });
    } catch (error) {
        console.error("Error in getting document keys:", error);
        res.status(500).json({ error: "Internal Server Error" });
    } finally {
        if (client) {
            client.release();
        }
    }
}

