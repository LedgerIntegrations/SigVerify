const importCryptoKey = async (keyBase64, type) => {
    const format = type === 'private' ? 'pkcs8' : 'spki';
    const keyData = Uint8Array.from(atob(keyBase64), (c) => c.charCodeAt(0));

    return window.crypto.subtle.importKey(
        format,
        keyData,
        {
            name: 'RSA-OAEP',
            hash: 'SHA-256',
        },
        false,
        type === 'private' ? ['decrypt'] : ['encrypt']
    );
};

export {importCryptoKey}