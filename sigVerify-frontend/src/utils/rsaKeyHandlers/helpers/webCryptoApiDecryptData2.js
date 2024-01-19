function base64ToArrayBuffer(base64) {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
}

async function importPrivateKey(base64PrivateKey) {
    const privateKeyBuffer = base64ToArrayBuffer(base64PrivateKey);
    return await window.crypto.subtle.importKey(
        'pkcs8',
        privateKeyBuffer,
        { name: 'RSA-OAEP', hash: { name: 'SHA-256' } },
        true,
        ['decrypt']
    );
}

async function decryptAesKey(encryptedKey, privateKey) {
    const encryptedKeyBuffer = base64ToArrayBuffer(encryptedKey);
    return await window.crypto.subtle.decrypt({ name: 'RSA-OAEP' }, privateKey, encryptedKeyBuffer);
}

async function decryptData(encryptedData, aesKey, iv) {
    const encryptedDataBuffer = base64ToArrayBuffer(encryptedData);
    const aesKeyObj = await window.crypto.subtle.importKey('raw', aesKey, { name: 'AES-GCM', length: 256 }, true, ['decrypt']);
    return await window.crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: base64ToArrayBuffer(iv) },
        aesKeyObj,
        encryptedDataBuffer
    );
}

async function handleDecrypt(userPrivateKeyBase64, documentData) {
    try {
        const privateKey = await importPrivateKey(userPrivateKeyBase64);
        const decryptedAesKey = await decryptAesKey(documentData.properties.encrypted_aes_key, privateKey);
        const decryptedDataBuffer = await decryptData(
            documentData.properties.encrypted_data,
            decryptedAesKey,
            documentData.properties.iv_base64
        );
      // return arrayBufferToString(decryptedDataBuffer); // Corrected this line
      return decryptedDataBuffer;

    } catch (error) {
        console.error('Decryption error:', error);
        throw error; // Or handle the error as required
    }
}

function arrayBufferToString(buffer) {
    const decoder = new TextDecoder('utf-8');
    return decoder.decode(buffer);
}

export { handleDecrypt };
