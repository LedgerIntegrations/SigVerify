// models/document.js
import pool from '../config/db.js';

class Document {
  // encrypted defaults to false, and expiresAt defaults to null
    static async createDocument({ userProfileId, title, description, category, encrypted, expiresAt }) {
        const { rows } = await pool.query(
            'INSERT INTO documents (user_profile_id, title, description, category, encrypted, expires_at) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [userProfileId, title, description, category, encrypted, expiresAt]
        );
        return rows[0];
    }

    static async getDocumentsByUserId(userProfileId) {
        const { rows } = await pool.query('SELECT * FROM documents WHERE user_profile_id = $1', [userProfileId]);
        return rows;
    }

    static async updateDocument(documentId, { title, description, category, encrypted, expiresAt }) {
        const { rows } = await pool.query(
            'UPDATE documents SET title = $1, description = $2, category = $3, encrypted = $4, expires_at = $5, updated_at = CURRENT_TIMESTAMP WHERE id = $6 RETURNING *',
            [title, description, category, encrypted, expiresAt, documentId]
        );
        return rows[0];
    }

    static async deleteDocument(documentId) {
        const { rows } = await pool.query('DELETE FROM documents WHERE id = $1 RETURNING *', [documentId]);
        return rows[0];
    }
}

export default Document;
