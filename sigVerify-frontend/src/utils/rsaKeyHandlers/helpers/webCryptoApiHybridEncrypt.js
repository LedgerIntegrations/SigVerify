import { importCryptoKey } from './webCryptoApiImportKey';

const arrayBufferToBase64 = (buffer) => {
    const bytes = new Uint8Array(buffer);
    const binary = bytes.reduce((acc, byte) => acc + String.fromCharCode(byte), '');
    return btoa(binary);
};

const hashData = async (data) => {
    // Hash the data using SHA-512
    const hashedData = await window.crypto.subtle.digest('SHA-512', data);
    return hashedData;
};

async function encryptDataWithAesGcm(data) {
    try {
        // Generate a symmetric key for AES-GCM
        const aesKey = await window.crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt']);

        // Generate an IV for AES-GCM
        const ivUint8Array = window.crypto.getRandomValues(new Uint8Array(12));

        // Encrypt the data using AES-GCM
        const aesEncryptedDocumentDataArrayBuffer = await window.crypto.subtle.encrypt(
            { name: 'AES-GCM', iv: ivUint8Array },
            aesKey,
            data
        );

        // Export the AES key
        const exportedAesKeyArrayBuffer = await window.crypto.subtle.exportKey('raw', aesKey);
        const sha512HashedArrayBufferOfExportedAesKey = await hashData(exportedAesKeyArrayBuffer);

        return {
            sha512HashedArrayBufferOfExportedAesKey,
            aesEncryptedDocumentDataArrayBuffer,
            aesCryptoKeyUsed: aesKey,
            ivUint8Array,
        };
    } catch (error) {
        console.error('AES-GCM encryption error:', error);
        throw error;
    }
}
// encrypts aes encryption key using RSA-OAEP public key
async function encryptAesKeyWithPublicKey(aesKey, publicKey) {
    try {
        // Export the AES key
        const exportedAesKey = await window.crypto.subtle.exportKey('raw', aesKey);

        // Encrypt the exported AES key using RSA-OAEP
        const encryptedAesKey = await window.crypto.subtle.encrypt({ name: 'RSA-OAEP' }, publicKey, exportedAesKey);
        const rsaOaepEncryptedAesKeyArrayBufferBase64Encoded = await arrayBufferToBase64(encryptedAesKey);
        return rsaOaepEncryptedAesKeyArrayBufferBase64Encoded;
    } catch (error) {
        console.error('RSA encryption error:', error);
        throw error;
    }
}
// usersThatCanDecrypt: [{emailHash, publicKeyBase64, wallet}]
const webCryptoApiHybridEncrypt = async (usersThatCanDecrypt, data) => {
    try {
        // Encrypt data with AES-GCM
        const {
            sha512HashedArrayBufferOfExportedAesKey,
            aesEncryptedDocumentDataArrayBuffer,
            aesCryptoKeyUsed,
            ivUint8Array,
        } = await encryptDataWithAesGcm(data);

        // Encrypt AES key with each public key and add encryptedAes key to array of given users
        const arrayOfUsersWithCorrespondingEncryptedAesKeyUsingEachPublicKey = await Promise.all(
            usersThatCanDecrypt.map(async (user) => {
                const publicKey = await importCryptoKey(user.publicKeyBase64, 'public');
                const encryptedAesKeyBase64 = await encryptAesKeyWithPublicKey(aesCryptoKeyUsed, publicKey);
                return {
                    ...user,
                    encryptedAesKeyBase64,
                };
            })
        );

        // Convert data to base64
        const aesEncryptedDocumentDataArrayBufferBase64Encoded = arrayBufferToBase64(
            aesEncryptedDocumentDataArrayBuffer
        );
        const ivUint8ArrayBase64Encoded = arrayBufferToBase64(ivUint8Array);
        const sha512HashedArrayBufferOfExportedAesKeyBase64Encoded = arrayBufferToBase64(
            sha512HashedArrayBufferOfExportedAesKey
        );

        return {
            sha512HashedArrayBufferOfExportedAesKeyBase64Encoded,
            aesEncryptedDocumentDataArrayBufferBase64Encoded,
            arrayOfUsersWithCorrespondingEncryptedAesKeyUsingEachPublicKey,
            ivUint8ArrayBase64Encoded,
        };
    } catch (error) {
        console.error('Error in hybrid encryption:', error);
        throw error;
    }
};

export { webCryptoApiHybridEncrypt };
