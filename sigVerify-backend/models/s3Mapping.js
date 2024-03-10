// models/S3MappingModel.js

import pool from '../config/db';

class S3MappingModel {
    /**
     * Create a mapping between a document and its S3 storage details.
     * @param {Object} mappingData - The data for creating a new S3 mapping.
     * @param {number} mappingData.document_id - The ID of the document.
    //  * @param {number} mappingData.s3_bucket_id - The ID of the S3 bucket.
     * @param {string} mappingData.s3_object_key - The key of the object in S3.
     * @param {string} mappingData.s3_object_url - The URL of the object in S3.
     * @returns {Promise<Object>} The newly created S3 mapping record.
     */
    static async create({ document_id, s3_object_key, s3_object_url }) {
        const { rows } = await pool.query(
            'INSERT INTO document_s3_mapping (document_id, s3_object_key, s3_object_url) VALUES ($1, $2, $3) RETURNING *',
            [document_id, s3_object_key, s3_object_url]
        );
        return rows[0];
    }

    /**
     * Find a mapping by the document ID.
     */
    static async findByDocumentId(document_id) {
        const { rows } = await pool.query('SELECT * FROM document_s3_mapping WHERE document_id = $1', [document_id]);
        return rows;
    }

    /**
     * Update the S3 mapping details for a given document.
     */
    static async update({ mapping_id, document_id, s3_object_key, s3_object_url }) {
        const { rows } = await pool.query(
            'UPDATE document_s3_mapping SET document_id = $2, s3_object_key = $3, s3_object_url = $4, updated_at = CURRENT_TIMESTAMP WHERE mapping_id = $1 RETURNING *',
            [mapping_id, document_id, s3_object_key, s3_object_url]
        );
        return rows[0];
    }

    /**
     * Delete a mapping by the mapping ID.
     */
    static async delete(mapping_id) {
        const { rows } = await pool.query('DELETE FROM document_s3_mapping WHERE mapping_id = $1 RETURNING *', [
            mapping_id,
        ]);
        return rows[0]; // Return the deleted mapping details, if needed.
    }

    // Add any other methods as necessary.
}

export default S3MappingModel;
