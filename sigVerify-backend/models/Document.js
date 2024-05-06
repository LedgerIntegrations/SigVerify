// models/document.js
import pool from '../config/db.js';
class DocumentModel {
    static async poolConnect() {
        return pool.connect();
    }

    /**
     * Creates a new document record along with its associated blob data in a transaction.
     * This method inserts the blob data into the document_blobs table, then links this blob to a new document entry.
     *
     * @param {number} userProfileId - The ID of the user's profile creating the document.
     * @param {Object} documentDetails - Details of the document like title, description, category, public status, and expiration date.
     * @param {Array} blobsDetails - Array of objects, each containing blob-related details like filename, content type, byte size, checksum, S3 object key, and S3 object URL.
     * @returns {Promise<Object>} The created document record along with blob IDs.
     */
    static async createDocumentWithBlob(userProfileId, documentDetails, blobDetails) {
        const client = await this.poolConnect();

        try {
            await client.query('BEGIN');

            // Insert into the documents table first
            const docRes = await client.query(
                `
                    INSERT INTO documents (user_profile_id, title, description, category, public, can_add_access, expires_at)
                    VALUES ($1, $2, $3, $4, $5, $6, $7)
                    RETURNING id;
                `,
                [
                    userProfileId,
                    documentDetails.title,
                    documentDetails.description,
                    documentDetails.category,
                    documentDetails.publicFlag,
                    documentDetails.publicFlag ? false : true,
                    documentDetails.expiresAt,
                ]
            );

            const documentId = docRes.rows[0].id;

            // For each blob detail, insert into the document_blobs table and link it to the created document
            await client.query(
                `
                        INSERT INTO document_blobs (document_id, filename, content_type, byte_size, checksum, s3_object_key, s3_object_url)
                        VALUES ($1, $2, $3, $4, $5, $6, $7);
                    `,
                [
                    documentId, // Link to the newly created document ID
                    blobDetails.filename,
                    blobDetails.contentType,
                    blobDetails.byteSize,
                    blobDetails.checksum,
                    blobDetails.s3ObjectKey,
                    blobDetails.s3ObjectUrl,
                ]
            );

            await client.query('COMMIT');
            return documentId;
        } catch (err) {
            await client.query('ROLLBACK');
            console.error('Error creating new document with blobs.', err);
            throw err;
        } finally {
            client.release();
        }
    }

    /**
     * Disables adding access to a document by setting the can_add_access flag to false.
     * This action can only be performed by the document's creator.
     *
     * @param {number} documentId - The ID of the document to update.
     * @param {number} userProfileId - The ID of the user attempting to modify the flag.
     * @returns {Promise<boolean>} True if the update was successful, false otherwise.
     */
    static async disableDocumentAccess(documentId, userProfileId) {
        const client = await this.poolConnect();
        try {
            await client.query('BEGIN');

            // Verify the user attempting to update is the creator of the document
            const verifyCreatorRes = await client.query(
                `SELECT id FROM documents WHERE id = $1 AND user_profile_id = $2;`,
                [documentId, userProfileId]
            );

            if (verifyCreatorRes.rowCount === 0) {
                // User is not the creator or the document doesn't exist
                await client.query('ROLLBACK');
                console.error('User is not the creator or the document does not exist.');
                return false;
            }

            // User is verified as the creator; proceed to update the can_add_access flag
            const updateRes = await client.query(
                `UPDATE documents SET can_add_access = FALSE WHERE id = $1 RETURNING *;`,
                [documentId]
            );

            await client.query('COMMIT');

            if (updateRes.rowCount > 0) {
                console.log('Document access disabled successfully.');
                return true; // The update was successful
            } else {
                console.error('Failed to update the document.');
                return false; // The update failed
            }
        } catch (err) {
            await client.query('ROLLBACK');
            console.error(`Error disabling document access: ${err.message}`);
            throw err;
        } finally {
            client.release();
        }
    }

    static async getAnyDocumentById(documentId) {
        const client = await this.poolConnect();

        try {
            const res = await client.query(
                `SELECT
                d.*, db.filename, db.content_type, db.byte_size,
                db.checksum, db.s3_object_key, db.s3_object_url, uc.email as uploader_email
                FROM documents d
                JOIN document_blobs db ON d.id = db.document_id
                JOIN user_profiles up ON d.user_profile_id = up.id
                JOIN user_contacts uc ON up.id = uc.user_profile_id
                WHERE d.id = $1`,
                [documentId]
            );

            if (res.rows.length) {
                return res.rows[0];
            } else {
                return null;
            }
        } catch (err) {
            console.error('Error retrieving document by ID with uploader email', err);
            throw err;
        } finally {
            client.release();
        }
    }

    //! TEST TEST TEST
    static async getDocumentById(documentId) {
        const client = await this.poolConnect();

        try {
            const res = await client.query(
                `SELECT
                d.*, db.filename, db.content_type, db.byte_size,
                db.checksum, db.s3_object_key, db.s3_object_url, uc.email as uploader_email
                FROM documents d
                JOIN document_blobs db ON d.id = db.document_id
                JOIN user_profiles up ON d.user_profile_id = up.id
                JOIN user_contacts uc ON up.id = uc.user_profile_id
                WHERE d.id = $1`,
                [documentId]
            );

            if (res.rows.length) {
                return res.rows[0];
            } else {
                return null;
            }
        } catch (err) {
            console.error('Error retrieving document by ID with uploader email', err);
            throw err;
        } finally {
            client.release();
        }
    }

    /**
     * Retrieves the document blob associated with a given document ID.
     *
     * @param {number} documentId - The ID of the document for which to retrieve the blob.
     * @returns {Promise<Object|null>} The document blob details if found, or null if no document is found.
     */
    static async getDocumentBlobByDocumentId(documentId) {
        const client = await this.poolConnect();

        try {
            // Query to join documents with document_blobs on document_id and return the blob data
            const res = await client.query(
                `SELECT db.*
                FROM document_blobs db
                JOIN documents d ON db.document_id = d.id
                WHERE d.id = $1;`,
                [documentId]
            );

            if (res.rows.length) {
                return res.rows[0]; // Assuming there is only one blob per document based on your schema
            } else {
                return null;
            }
        } catch (err) {
            console.error('Error retrieving document blob by document ID', err);
            throw err;
        } finally {
            client.release();
        }
    }

    static async getPublicDocumentsByUserEmail(userEmail) {
        const client = await this.poolConnect();
        try {
            // Fetching public documents linked to a user profile through user_contacts by email.
            // This query selects documents directly since there's no direct linkage in the schema between user_contacts and documents.
            // This assumes each user_profile has at least one user_contact with an email.
            const res = await client.query(
                `
                SELECT d.*
                FROM documents d
                JOIN user_profiles up ON d.user_profile_id = up.id
                JOIN user_contacts uc ON up.id = uc.user_profile_id
                WHERE uc.email = $1 AND d.public = TRUE;
                `,
                [userEmail]
            );

            return res.rows;
        } catch (err) {
            console.error('Error finding public documents by user email', err);
            throw new Error('Error finding public documents by user email');
        } finally {
            client.release();
        }
    }

    /**
     * Retrieves all documents uploaded by a user identified by their profile ID.
     *
     * @param {number} userProfileId - The ID of the user profile.
     * @returns {Promise<Array>} An array of documents uploaded by the user.
     */
    static async getAllUploadedDocuments(userProfileId) {
        const client = await this.poolConnect();

        try {
            // Query to select all documents uploaded by the user
            const res = await client.query(
                `
                SELECT d.id, d.title, d.description, d.category, d.public, d.expires_at,
                      d.created_at, d.updated_at,
                      db.filename, db.content_type, db.byte_size,
                      db.checksum, db.s3_object_url
                FROM documents d
                LEFT JOIN document_blobs db ON d.id = db.document_id
                WHERE d.user_profile_id = $1
                ORDER BY d.created_at DESC;`, // order filtering
                [userProfileId]
            );

            return res.rows;
        } catch (err) {
            console.error('Error retrieving all uploaded documents by user profile ID', err);
            throw err;
        } finally {
            client.release();
        }
    }

    /**
     * Updates document metadata.
     *
     * @param {number} documentId - The ID of the document to update.
     * @param {Object} updateFields - Fields to update with their new values.
     * @returns {Promise<Object>} The updated document record.
     */
    static async updateDocument(documentId, updateFields) {
        const client = await this.poolConnect();

        try {
            const setClause = Object.keys(updateFields)
                .map((key, index) => `${key} = $${index + 2}`)
                .join(', ');
            const queryValues = [documentId, ...Object.values(updateFields)];

            await client.query('BEGIN');

            const res = await client.query(
                `
                  UPDATE documents
                  SET ${setClause}
                  WHERE id = $1
                  RETURNING *;
              `,
                queryValues
            );

            await client.query('COMMIT');

            return res.rows[0];
        } catch {
            await client.query('ROLLBACK');
            console.error('Error updating document metadata', err);

            throw err;
        } finally {
            client.release();
        }
    }

    /**
     * Deletes a document by ID if document uploader(user_profile_id) matches auth logged in users profile_id.
     *
     * @param {number} documentId - The ID of the document to delete.
     * @param {number} userProfileId - The ID of the authenticated user's profile attempting to delete the document.
     * @returns {Promise<boolean>} True if the document was successfully deleted, false otherwise.
     */
    static async deleteDocument(documentId, userProfileId) {
        const client = await this.poolConnect();

        try {
            await client.query('BEGIN');

            // Delete the document that meets all conditions
            const res = await client.query(
                `DELETE FROM documents
                WHERE id = $1 AND user_profile_id = $2
                RETURNING *;`,
                [documentId, userProfileId]
            );

            if (res.rowCount === 0) {
                await client.query('ROLLBACK');
                console.error('No document found or user mismatch.');
                return false;
            }

            await client.query('COMMIT');
            return true;
        } catch (err) {
            await client.query('ROLLBACK');
            console.error(`Error while trying to delete document: ${err.message}`);
            throw err;
        } finally {
            client.release();
        }
    }
}

export default DocumentModel;
