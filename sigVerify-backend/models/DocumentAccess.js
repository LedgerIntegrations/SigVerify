// models/documentAccessModel.js
import pool from '../config/db.js';

class DocumentAccessModel {
    static async poolConnect() {
        return pool.connect();
    }

    /**
     * Adds or updates access rights to a document for a specified user profile, email, or wallet address.
     * This method checks if the current user is the uploader of the document before proceeding.
     *
     * @param {number} uploaderId - The ID of the user attempting to modify access rights.
     * @param {Object} accessDetails - Details of the access to be added including documentId, userProfileId, email, walletAddress, and accessType.
     * @returns {Promise<Object>} The created or updated document access record.
     */

    // * can either be email, wallet, or profile_id as link because if user does not currently exist, they can create an account and exist after document is uploaded
    static async addOrUpdateAccessToDocument(uploaderId, { documentId, email, walletAddress }) {
        const client = await this.poolConnect();
        try {
            await client.query('BEGIN');

            // Verify the uploader is the owner of the document
            const verifyUploaderRes = await client.query(
                `SELECT id FROM documents WHERE id = $1 AND user_profile_id = $2 AND can_add_access = TRUE;`,
                [documentId, uploaderId]
            );

            if (verifyUploaderRes.rowCount === 0) {
                throw new Error(
                    "Operation not permitted. Either you're not the document's uploader or adding access is disabled for this document."
                );
            }

            // Check for an existing record with the same documentId and either email or walletAddress
            let existingAccessRes;
            if (email) {
                existingAccessRes = await client.query(
                    `SELECT id FROM document_access WHERE document_id = $1 AND email = $2;`,
                    [documentId, email]
                );
            } else if (walletAddress) {
                existingAccessRes = await client.query(
                    `SELECT id FROM document_access WHERE document_id = $1 AND wallet_address = $2;`,
                    [documentId, walletAddress]
                );
            }

            // If an existing record is found, update it; otherwise, insert a new record
            if (existingAccessRes && existingAccessRes.rowCount > 0) {
                // Update the existing record if it already exists
                await client.query(`UPDATE document_access SET updated_at = NOW() WHERE id = $1 RETURNING *;`, [
                    existingAccessRes.rows[0].id,
                ]);
            } else {
                // Insert a new record
                await client.query(
                    `INSERT INTO document_access (document_id, email, wallet_address) VALUES ($1, $2, $3) RETURNING *;`,
                    [documentId, email || null, walletAddress || null]
                );
            }

            await client.query('COMMIT');
        } catch (err) {
            await client.query('ROLLBACK');
            throw new Error(`Failed to add or update access to document: ${err.message}`);
        } finally {
            client.release();
        }
    }

    /**
     * Deletes a document access entry by the document access ID.
     *
     * @param {number} accessId - The ID of the document access entry to delete.
     * @param {number} requestingUserId - The ID of the user requesting the deletion.
     * @returns {Promise<boolean>} True if the deletion was successful, false otherwise.
     */
    static async deleteAccessById(accessId, requestingUserId) {
        const client = await this.poolConnect();
        try {
            await client.query('BEGIN');

            const verificationRes = await client.query(
                `SELECT d.user_profile_id
                FROM document_access da
                JOIN documents d ON da.document_id = d.id
                WHERE da.id = $1 AND d.user_profile_id = $2 AND d.can_add_access = TRUE;`,
                [accessId, requestingUserId]
            );

            if (verificationRes.rowCount === 0) {
                // If no rows are returned, either the user does not have permission to delete this access or adding/deleting access is disabled
                throw new Error(
                    'Permission denied: User does not have rights to delete this access or document does not allow modifying access.'
                );
            }

            // Proceed with deletion if the user has the necessary permissions
            const deleteRes = await client.query(`DELETE FROM document_access WHERE id = $1;`, [accessId]);

            await client.query('COMMIT');

            // Check if any rows were affected
            if (deleteRes.rowCount > 0) {
                return true; // Deletion successful
            } else {
                return false; // No rows deleted, possibly due to non-existent ID
            }
        } catch (err) {
            await client.query('ROLLBACK');
            console.error(`Failed to delete document access entry: ${err.message}`);
            throw err;
        } finally {
            client.release();
        }
    }

    /**
     * Retrieves all access rights for a specific document.
     *
     * @param {number} documentId - The ID of the document to retrieve access for.
     * @returns {Promise<Array>} An array of access records.
     */
    static async getAccessObjectsByDocumentId(documentId) {
        const client = await this.poolConnect();
        try {
            const res = await client.query(
                `
                SELECT * FROM document_access
                WHERE document_id = $1;
                `,
                [documentId]
            );
            return res.rows;
        } catch (err) {
            throw new Error(`Failed to retrieve doucment access rights: ${err.message}`);
        } finally {
            client.release();
        }
    }

    /**
     * Retrieves all documents a specific user was given access to, based on their userProfileId.
     *
     * @param {number} userProfileId - The ID of the user profile.
     * @returns {Promise<Array>} An array of documents the user has access to.
     */

    // TODO: modify to search by not only profileId, but also wallet_address or email from the document_access table
    static async getAllDocumentsUserWasGivenAccessTo(email) {
        const client = await this.poolConnect();
        try {
            const query = `
              SELECT d.* FROM documents d
              JOIN document_access da ON da.document_id = d.id
              WHERE da.email = $1;
            `;
            const params = [email];

            const res = await client.query(query, params);
            return res.rows;
        } catch (err) {
            throw new Error(`Failed to retrieve user's documents: ${err.message}`);
        } finally {
            client.release();
        }
    }

    /**
     * Retrieves all documents accessible to a specific user.
     * This includes documents directly owned by the user or where access has been granted.
     *
     * @param {number} userProfileId - The ID of the user profile to fetch accessible documents for.
     * @returns {Promise<Array>} An array of documents accessible to the user.
     */
  // TODO: modify to search by not only profileId, but also wallet_address or email from the document_access table
  // currently gets all user documents and
    static async getAllGivenAccessAndUploadedPrivateDocuments(userProfileId, userEmail) {
        const client = await this.poolConnect();
        try {
            const query = `
              SELECT DISTINCT d.* FROM documents d
              LEFT JOIN document_access da ON da.document_id = d.id
              WHERE (d.user_profile_id = $1 OR da.email = $2)
              AND d.public = false
              ORDER BY d.can_add_access DESC, d.id DESC;
            `;

            const params = [userProfileId, userEmail];

            const res = await client.query(query, params);
            return res.rows;
        } catch (err) {
            throw new Error(`Failed to retrieve non-public accessible documents for user: ${err.message}`);
        } finally {
            client.release();
        }
    }
}

export default DocumentAccessModel;
