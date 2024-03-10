// DocumentsModel.js
import pool from '../config/db.js';

class DocumentsModel {
    static async checkIfDocumentExists(documentId) {
        const query = `
            SELECT 1 FROM documents WHERE id = $1;
        `;
        const result = await pool.query(query, [documentId]);
        return result.rowCount > 0;
    }

    static async storeNewDocument(userId, documentData) {
        const {
            title,
            description,
            category,
            encrypted,
            documentName,
            documentType,
            documentSize,
            requiredSignersWallets,
            allInvolvedHashedEmails,
            ipfsHash,
        } = documentData;

        const insertQuery = `
            INSERT INTO documents
            (user_meta_id, title, description, category, encrypted, document_name, document_type, document_size, required_signers_wallets, all_involved_hashed_emails, ipfs_hash)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            RETURNING id;
        `;

        const result = await pool.query(insertQuery, [
            userId,
            title,
            description,
            category,
            encrypted,
            documentName,
            documentType,
            documentSize,
            requiredSignersWallets,
            allInvolvedHashedEmails,
            ipfsHash,
        ]);
        return result.rows[0].id;
    }

    static async addDocumentSignature(docId, userId, xrplTxHash) {
        const insertQuery = `
            INSERT INTO signatures (document_id, user_id, xrpl_tx_hash)
            VALUES ($1, $2, $3)
            RETURNING id;
        `;
        const result = await pool.query(insertQuery, [docId, userId, xrplTxHash]);
        return result.rows[0].id;
    }

    static async getAllUserDocumentsWithSignatureStatus(userId, hashedEmail) {
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
                ) as xrpl_tx_hashes,
                (SELECT email FROM user_email WHERE user_meta_id = d.user_meta_id LIMIT 1) AS creator_email,
                ARRAY(
                    SELECT ue.email FROM user_email ue
                    INNER JOIN user_auth ua ON ue.user_meta_id = ua.id
                    WHERE ua.hashed_email = ANY(d.all_involved_hashed_emails)
                ) AS recipient_emails
          FROM documents d
          WHERE d.user_meta_id = $1 OR $2 = ANY(d.all_involved_hashed_emails);
      `;

        const result = await pool.query(documentsQuery, [userId, hashedEmail]);
        return result.rows;
    }

    static async hasUserSignedDocument(docId, userId) {
        const query = `
            SELECT EXISTS (
                SELECT 1
                FROM signatures
                WHERE document_id = $1 AND user_id = $2
            ) as has_signed;
        `;
        const result = await pool.query(query, [docId, userId]);
        return result.rows[0].has_signed;
    }
}

export default DocumentsModel;