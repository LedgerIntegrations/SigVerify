function pemToBuff(pem) {
    // Remove PEM headers and footers
    const base64String = pem
        .replace(/-----BEGIN .+ KEY-----/g, '')
        .replace(/-----END .+ KEY-----/g, '')
        .replace(/\n/g, '');

    // Convert Base64 string to ArrayBuffer
    const binaryString = atob(base64String);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
}

export { pemToBuff };
