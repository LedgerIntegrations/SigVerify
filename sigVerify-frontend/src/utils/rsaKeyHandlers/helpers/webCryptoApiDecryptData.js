import { importCryptoKey } from './webCryptoApiImportKey';

const webCryptoApiDecryptData = async (privateKeyBase64, encryptedBase64) => {
    try {
        // Decode the base64 private key
        const privateKey = await importCryptoKey(privateKeyBase64, 'private');

        // Convert the base64 encrypted data to an ArrayBuffer
        const encryptedBuffer = Uint8Array.from(atob(encryptedBase64), (c) => c.charCodeAt(0));

        // Decrypt the data
        const decrypted = await window.crypto.subtle.decrypt(
            {
                name: 'RSA-OAEP',
            },
            privateKey,
            encryptedBuffer
        );

        // Convert decrypted data to a string
        const decoder = new TextDecoder();
        const decryptedString = decoder.decode(decrypted);
        return JSON.parse(decryptedString);
    } catch (error) {
        console.error('Error decrypting data:', error);
        return null;
    }
};

export { webCryptoApiDecryptData };
