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
        const iv = window.crypto.getRandomValues(new Uint8Array(12));

        // Encrypt the data using AES-GCM
        const encryptedData = await window.crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv }, aesKey, data);

        // Export the AES key
        const exportedAesKey = await window.crypto.subtle.exportKey('raw', aesKey);

        // Hash the raw data and the exported AES key
        const rawDataSha512Hash = await hashData(data);
        const aesKeySha512Hash = await hashData(exportedAesKey);

        return {
            rawDataSha512Hash, // hashed arrayBuffer of raw document data
            aesKeySha512Hash, // hashed arrayBuffer of exported AES key
            encryptedData,
            aesKey,
            iv,
        };
    } catch (error) {
        console.error('AES-GCM encryption error:', error);
        throw error;
    }
}

async function encryptAesKeyWithPublicKey(aesKey, publicKey) {
    try {
        // Export the AES key
        const exportedAesKey = await window.crypto.subtle.exportKey('raw', aesKey);

        // Encrypt the exported AES key using RSA-OAEP
        const encryptedAesKey = await window.crypto.subtle.encrypt({ name: 'RSA-OAEP' }, publicKey, exportedAesKey);

        return {
            encryptedAesKey,
            publicKeyUsed: publicKey,
        };
    } catch (error) {
        console.error('RSA encryption error:', error);
        throw error;
    }
}

const webCryptoApiHybridEncrypt = async (publicKeysBase64, data) => {
    try {
        // Encrypt data with AES-GCM
        const { encryptedData, aesKey, iv, rawDataSha512Hash, aesKeySha512Hash } = await encryptDataWithAesGcm(data);

        // Encrypt AES key with each public key
        const encryptedAesKeys = await Promise.all(
            publicKeysBase64.map(async (publicKeyBase64) => {
                const publicKey = await importCryptoKey(publicKeyBase64, 'public');
                return encryptAesKeyWithPublicKey(aesKey, publicKey);
            })
        );

        // Convert data to base64
        const encryptedDataBase64 = arrayBufferToBase64(encryptedData);
        const ivBase64 = arrayBufferToBase64(iv);
        const aesKeyHashBase64 = arrayBufferToBase64(aesKeySha512Hash);
        const rawDataSha512HashBase64 = arrayBufferToBase64(rawDataSha512Hash);

        return encryptedAesKeys.map((encryptedAesKey) => ({
            dataHash: rawDataSha512HashBase64,
            aesKeyHash: aesKeyHashBase64,
            encryptedData: encryptedDataBase64,
            encryptedAesKeyBase64: arrayBufferToBase64(encryptedAesKey.encryptedAesKey),
            publicKeyUsedBase64: encryptedAesKey.publicKeyUsed,
            iv: ivBase64,
        }));
    } catch (error) {
        console.error('Error in hybrid encryption:', error);
        throw error;
    }
};

export { webCryptoApiHybridEncrypt };
