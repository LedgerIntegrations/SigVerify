// models/signatureModel.js
import pool from '../config/db.js';

class SignatureModel {
    static async poolConnect() {
        return pool.connect();
    }
    /**
     * Validates an XRPL transaction hash format.
     * @param {string} txHash The XRPL transaction hash to validate.
     * @returns {boolean} True if valid, false otherwise.
     */
    static isValidXrplTxHash(txHash) {
        return /^([A-Fa-f0-9]{64})$/.test(txHash);
    }

    /**
     * Verifies if the provided wallet address belongs to the user.
     * @param {number} userProfileId The user's profile ID.
     * @param {string} walletAddress The wallet address to verify.
     * @returns {Promise<boolean>} True if the wallet belongs to the user, false otherwise.
     */
    static async verifyUserWallet(userProfileId, walletAddress) {
        const res = await pool.query(
            `
            SELECT 1 FROM xrpl_wallets
            WHERE user_profile_id = $1 AND wallet_address = $2;
        `,
            [userProfileId, walletAddress]
        );

        return res.rowCount > 0;
    }

    /**
     * Verifies the document's checksum to ensure its integrity.
     * @param {number} documentId The ID of the document.
     * @param {string} documentChecksum The checksum to verify.
     * @returns {Promise<boolean>} True if the checksum is valid, false otherwise.
     */
    static async verifyDocumentChecksum(documentId, documentChecksum) {
        const res = await pool.query(
            `
            SELECT id FROM document_blobs
            WHERE document_id = $1 AND checksum = $2;
            `,
            [documentId, documentChecksum]
        );

        return res.rowCount > 0;
    }

    /**
     * Records a signature against a document, including validation against the XRPL and checksum verification.
     * @param {Object} signatureDetails The details of the signature including documentId, userProfileId, xrplTxHash, signerWalletAddress, and documentChecksum.
     * @returns {Promise<Object>} The recorded signature.
     */
    static async signDocument({ documentId, xrplTxHash, signerWalletAddress, documentChecksum }) {
        const client = await this.poolConnect();

        // Validate the XRPL transaction hash
        if (!this.isValidXrplTxHash(xrplTxHash)) {
            throw new Error('Invalid XRPL transaction hash.');
        }

        // Verify the document checksum
        if (!(await this.verifyDocumentChecksum(documentId, documentChecksum))) {
            throw new Error('Document checksum does not match. The document may have been altered.');
        }

        let signatureRes;

        try {
            // Start the transaction
            await client.query('BEGIN');

            // Attempt to insert the signature into the database
            signatureRes = await client.query(
                `
                    INSERT INTO signatures (document_id, xrpl_tx_hash, signer_wallet_address, document_checksum)
                    VALUES ($1, $2, $3, $4)
                    RETURNING *;
                `,
                [documentId, xrplTxHash, signerWalletAddress, documentChecksum]
            );

            // Commit the transaction
            await client.query('COMMIT');
        } catch (error) {
            // Roll back the transaction in case of an error
            await client.query('ROLLBACK');

            // Check if the error is due to a unique constraint violation
            if (error.code === '23505') {
                // 23505 is the error code for unique_violation in PostgreSQL
                console.error('A signature from this wallet address for the document already exists.');
                throw new Error('You have already signed this document.');
            } else {
                console.error('Error creating signature: ', error);
                throw error; // Rethrow the error if it's not a unique constraint violation
            }
        } finally {
            // Release the client back to the pool
            client.release();
        }

        return signatureRes ? signatureRes.rows[0] : null;
    }

    /**
     * Fetches all signatures for a specific document.
     * @param {number} documentId The ID of the document to retrieve signatures for.
     * @returns {Promise<Array>} An array of signatures.
     */
    static async getSignaturesByDocumentId(documentId) {
        const res = await pool.query(
            `
            SELECT * FROM signatures WHERE document_id = $1;
            `,
            [documentId]
        );

        return res.rows;
    }

    /**
     * Fetches the signature status for a specific document, including total recipients,
     * total signatures, and signature status (completed, pending, or partial).
     * @param {number} documentId The ID of the document to retrieve the signature status for.
     * @returns {Promise<Object>} An object containing the signature status information.
     */
    static async getDocumentSignatureStatus(documentId) {
        try {
            const { rows } = await pool.query(
                `
                WITH RecipientSignatures AS (
                    SELECT
                        da.document_id,
                        da.email,
                        da.wallet_address,
                        CASE
                            WHEN xrpl.wallet_address IS NOT NULL THEN s.id
                            WHEN uc.email IS NOT NULL THEN s.id
                            ELSE NULL
                        END AS signature_id
                    FROM document_access da
                    LEFT JOIN user_contacts uc ON uc.email = da.email
                    LEFT JOIN xrpl_wallets xrpl ON xrpl.user_profile_id = uc.user_profile_id
                    LEFT JOIN signatures s ON s.document_id = da.document_id AND s.signer_wallet_address = xrpl.wallet_address
                    WHERE da.document_id = $1
                )
                SELECT
                    d.id AS document_id,
                    COUNT(DISTINCT CASE WHEN r.email IS NOT NULL OR r.wallet_address IS NOT NULL THEN CONCAT(r.email, r.wallet_address) END) AS total_recipients,
                    COUNT(DISTINCT r.signature_id) AS total_signatures,
                    CASE
                        WHEN COUNT(DISTINCT CASE WHEN r.email IS NOT NULL OR r.wallet_address IS NOT NULL THEN CONCAT(r.email, r.wallet_address) END) = COUNT(DISTINCT r.signature_id) AND COUNT(DISTINCT r.signature_id) > 0 THEN 'completed'
                        WHEN COUNT(DISTINCT r.signature_id) = 0 THEN 'pending'
                        ELSE 'partial'
                    END AS signature_status
                FROM documents d
                LEFT JOIN RecipientSignatures r ON d.id = r.document_id
                WHERE d.id = $1
                GROUP BY d.id;
                `,
                [documentId]
            );

            return rows[0];
        } catch (err) {
            console.error('Error fetching document signature status:', err);
            throw err;
        }
    }

    /**
     * Fetches all signatures made by the XRPL wallet addresses linked to a user's profile ID.
     * @param {number} userProfileId The ID of the user profile.
     * @returns {Promise<Array>} An array of signatures made by the user's XRPL wallet addresses.
     */
    static async getSignaturesByUserProfileId(userProfileId) {
        const res = await pool.query(
            `
            SELECT s.*
            FROM signatures s
            JOIN xrpl_wallets x ON s.signer_wallet_address = x.wallet_address
            WHERE x.user_profile_id = $1;
            `,
            [userProfileId]
        );
        return res.rows;
    }
}

export default SignatureModel;
