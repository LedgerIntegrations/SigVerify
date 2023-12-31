import React, { useState } from 'react';
import crypto from 'crypto-browserify';

const DocumentEncryptor = ({ publicKey }) => {
    const [document, setDocument] = useState('');
    const [encryptedDocument, setEncryptedDocument] = useState('');

    const encryptDocument = () => {
        const buffer = Buffer.from(document, 'utf8');
        const encrypted = crypto.publicEncrypt(publicKey, buffer);
        setEncryptedDocument(encrypted.toString('base64'));
    };

    return (
      <div>
        <br />
            <textarea
                value={document}
                onChange={(e) => setDocument(e.target.value)}
                placeholder="Enter document to encrypt"
        />
        <br />
            <button onClick={encryptDocument}>Encrypt Document</button>
            {encryptedDocument && <textarea value={encryptedDocument} readOnly />}
        </div>
    );
};

export default DocumentEncryptor;
